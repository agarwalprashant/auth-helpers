import {
	CookieAuthStorageAdapter,
	CookieOptions,
	CookieOptionsWithName,
	SupabaseClientOptionsWithoutAuth,
	createSupabaseClient
} from '@supabase/auth-helpers-shared';
import { cookies } from 'next/headers';

import type { SupabaseClient } from '@supabase/supabase-js';
import type { GenericSchema } from '@supabase/supabase-js/dist/module/lib/types';

class NextServerComponentAuthStorageAdapter extends CookieAuthStorageAdapter {
	constructor(
		private readonly context: {
			cookies: () => ReturnType<typeof cookies>;
		},
		cookieOptions?: CookieOptions
	) {
		super(cookieOptions);
	}

	protected getCookie(name: string): string | null | undefined {
		const nextCookies = this.context.cookies();
		return nextCookies.get(name)?.value;
	}
	protected setCookie(name: string, value: string): void {
		// Server Components cannot set cookies. Must use Middleware, Server Action or Route Handler
		// https://github.com/vercel/next.js/discussions/41745#discussioncomment-5198848
	}
	protected deleteCookie(name: string): void {
		// Server Components cannot set cookies. Must use Middleware, Server Action or Route Handler
		// https://github.com/vercel/next.js/discussions/41745#discussioncomment-5198848
	}
}

Alright, let's delve deeper into the provided TypeScript code segment:

typescript
Copy code
createServerComponentClient<
	Database = any,
	SchemaName extends string & keyof Database = 'public' extends keyof Database
		? 'public'
		: string & keyof Database,
	Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
		? Database[SchemaName]
		: any
>
// This is a generic function signature for createServerComponentClient. Let's break down its generics:

// Database = any:

// This is a generic type named Database. By default, if it's not provided when the function is invoked, it will assume the type any. The any type is a powerful way in TypeScript to work with any data type.
// SchemaName extends string & keyof Database:

// SchemaName is another generic type that must extend two things:
// string: This ensures whatever is provided as SchemaName is a string.
// keyof Database: This ensures that SchemaName is also a key of the Database type. The keyof keyword in TypeScript produces a union of the keys of an object type.
// Default for SchemaName:

// There is a default type assigned to SchemaName which is a conditional type:
// typescript
// Copy code
// 'public' extends keyof Database ? 'public' : string & keyof Database
// This checks if the string 'public' is a key of Database. If it is, 'public' is assigned as the default type for SchemaName. Otherwise, it falls back to any string that is a key of Database.
// Schema extends GenericSchema:

// Schema is another generic type. It is constrained to extend GenericSchema. This means any type assigned to Schema must be a subtype of GenericSchema or GenericSchema itself.
// Default for Schema:

// Similar to SchemaName, there's a default type for Schema which is also conditional:
// typescript
// Copy code
// Database[SchemaName] extends GenericSchema ? Database[SchemaName] : any
// This checks if the type of Database at key SchemaName extends GenericSchema. If it does, Database[SchemaName] is set as the default type for Schema. Otherwise, the type defaults to any.
// In summary, this generic function signature is allowing flexibility in how you interact with some kind of database schema, while also enforcing type safety where possible. The generics provide defaults but can be overridden when the function is invoked if stricter, more specific types are required.

export function createServerComponentClient<
	Database = any,
	SchemaName extends string & keyof Database = 'public' extends keyof Database
		? 'public'
		: string & keyof Database,
	Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
		? Database[SchemaName]
		: any
>(
	context: {
		cookies: () => ReturnType<typeof cookies>;
	},
	{
		supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL,
		supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		options,
		cookieOptions
	}: {
		supabaseUrl?: string;
		supabaseKey?: string;
		options?: SupabaseClientOptionsWithoutAuth<SchemaName>;
		cookieOptions?: CookieOptionsWithName;
	} = {}
): SupabaseClient<Database, SchemaName, Schema> {
	if (!supabaseUrl || !supabaseKey) {
		throw new Error(
			'either NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables or supabaseUrl and supabaseKey are required!'
		);
	}

	return createSupabaseClient<Database, SchemaName, Schema>(supabaseUrl, supabaseKey, {
		...options,
		global: {
			...options?.global,
			headers: {
				...options?.global?.headers,
				'X-Client-Info': `${PACKAGE_NAME}@${PACKAGE_VERSION}`
			}
		},
		auth: {
			storageKey: cookieOptions?.name,
			storage: new NextServerComponentAuthStorageAdapter(context, cookieOptions)
		}
	});
}
