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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { signinSchema, SigninFormType } from '../../schema/signin.schema';
import { Helmet } from 'react-helmet-async';
import { useLocation, Form as ReactRouterForm, useSubmit, Link, ActionFunction, redirect } from 'react-router-dom';
import { ChevronLeft, LogIn } from 'lucide-react';
import secretariumHandler from '../../utils/secretarium-handler';
import { LOC_KEY } from '../../utils/constants';
import { KeyPair } from '../../utils/types';
import { Key, Utils } from '@secretarium/connector';
//import { isExistingUser } from '../../utils/api';
import { urlToId } from '../../utils/helpers';

export const SignIn = () => {
    const { state } = useLocation();
    const submit = useSubmit();

    const form = useForm<SigninFormType>({
        resolver: zodResolver(signinSchema),
        defaultValues: {
            name: state?.keyPair?.name,
            password: ''
        }
    });

    const onSubmit = (data: any) => {
        submit({ ...data }, { method: 'post' });
    };

    return (
        <>
            <Helmet>
                <title>Welcome | Secure Data Rooms</title>
            </Helmet>
            <h1 className="p-4 text-2xl font-semibold">Secure Data Rooms</h1>
            <Form {...form}>
                <ReactRouterForm onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Type in name of your key" disabled {...field} />
                                </FormControl>
                                <FormDescription>This is your public display name.</FormDescription>
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
                    <div className="flex justify-between gap-4">
                        <Link to="/auth">
                            <Button className="w-full" variant="outline">
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Go back
                            </Button>
                        </Link>
                        <Button type="submit" className="w-full">
                            <LogIn className="mr-2 h-4 w-4" />
                            Sign in
                        </Button>
                    </div>
                </ReactRouterForm>
            </Form>
        </>
    );
};

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const name = formData.get('name');
    const password = formData.get('password');

    if (typeof name !== 'string') {
        return { error: true, message: 'Please fill in a name.' };
    }

    if (typeof password !== 'string') {
        return { error: true, message: 'Please fill in your password.' };
    }

    let base64key = '';

    const existingKeyPairs = window.localStorage.getItem(LOC_KEY);

    if (existingKeyPairs) {
        const parsedKeys: KeyPair[] = JSON.parse(existingKeyPairs);
        const keyPair = parsedKeys.find((keyPair) => keyPair.name === name);

        if (!keyPair) {
            return { error: true, message: 'Invalid key pair.' };
        }

        await secretariumHandler
            .use(keyPair, password)
            .then(Key.importKey)
            .then((key) => key.getRawPublicKey())
            .then((rawPublicKey) => Utils.hash(rawPublicKey))
            .then((hashPublicKey) => {
                (window as any).currentDevicePublicKeyHash = Utils.toBase64(hashPublicKey, true);
                base64key = Utils.toBase64(hashPublicKey, true);
                return secretariumHandler.connect();
            })
            .catch(console.error);
    }

    // const result = await isExistingUser(urlToId(base64key));

    // if (!result.success) {
    //     return {
    //         error: true,
    //         message: result.exception
    //     };
    // }

    return redirect('/');
};
