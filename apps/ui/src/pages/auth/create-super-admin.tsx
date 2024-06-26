import { Helmet } from 'react-helmet-async';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
    Button,
    Input,
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@klave-secure-rooms/ui-kit/ui';
import { ChevronLeft, LogIn } from 'lucide-react';
import { redirect, type ActionFunction, Form as ReactRouterForm, useActionData, Link } from 'react-router-dom';
import secretariumHandler from '../../utils/secretarium-handler';
import { Key, Utils } from '@secretarium/connector';
import { createSuperAdmin } from '../../utils/api';
import { ActionData } from '../../utils/types';
import { LOC_KEY } from '../../utils/constants';
import { registerSchema, RegisterFormType } from '../../schema/register.schema';
//import { urlToId } from '../../utils/helpers';

export const CreateSuperAdmin = () => {
    const result = useActionData() as ActionData;
    const form = useForm<RegisterFormType>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            password: '',
            confirmPassword: ''
        }
    });

    // const onSubmit = (data: any) => {
    //     console.log('onSubmit');
    //     submit({ ...data }, { method: 'post' });
    // };

    return (
        <>
            <Helmet>
                <title>Create Super Admin | Secure Data Rooms</title>
            </Helmet>
            <h1 className="p-4 text-2xl font-semibold">Secure Data Rooms</h1>
            <Form {...form}>
                <ReactRouterForm className="max-w-80 space-y-4" method="post">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Type in your key's name" {...field} />
                                </FormControl>
                                <FormDescription>This is the name of your key.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Type in your password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder="Type in your password" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="flex justify-between gap-4">
                        <Link to="/auth">
                            <Button className="w-full" variant="outline">
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Go back
                            </Button>
                        </Link>
                        <Button type="submit" className="w-full bg-blue-500">
                            <LogIn className="mr-2 h-4 w-4" />
                            Create Super Admin
                        </Button>
                    </div>
                </ReactRouterForm>
            </Form>
            {result?.error ? <span className="pt-4 text-red-500">{result?.message}</span> : null}
        </>
    );
};

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (typeof name !== 'string') {
        return { error: true, message: 'Please fill in a name.' };
    }

    if (typeof password !== 'string') {
        return { error: true, message: 'Please fill in your password.' };
    }

    if (typeof confirmPassword !== 'string') {
        return { error: true, message: 'Please confirm your password.' };
    }

    if (password !== confirmPassword) {
        return { error: true, message: "Passwords don't match." };
    }

    let base64key = '';

    await secretariumHandler
        .createKeyPair({
            name: name,
            password: password
        })
        .then((encKey) => {
            const localeStorageKey = LOC_KEY;
            const json = window.localStorage.getItem(localeStorageKey);
            const prevKeys = json ? JSON.parse(json) : [];
            console.log(prevKeys);
            const updatedKeys = [...prevKeys, encKey];
            const uniqueKeys = [...new Set(updatedKeys)];
            window.localStorage.setItem(localeStorageKey, JSON.stringify(uniqueKeys));
            return Key.importEncryptedKeyPair(encKey, password);
        })
        .then((key) => key.getRawPublicKey())
        .then((rawPublicKey) => Utils.hash(rawPublicKey))
        .then((hashPublicKey) => {
            (window as any).currentDevicePublicKeyHash = Utils.toBase64(hashPublicKey, true);
            base64key = Utils.toBase64(hashPublicKey, true);
            return secretariumHandler.connect();
        })
        .catch(console.error);

    const result = await createSuperAdmin();

    console.log(result);

    if (!result.success) {
        return {
            error: true,
            message: result.message
        };
    }

    return redirect('/admin');
};
