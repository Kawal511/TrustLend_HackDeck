// app/(auth)/sign-in/[[...sign-in]]/page.tsx

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
            <SignIn
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "bg-white/10 backdrop-blur-lg border border-white/20",
                        headerTitle: "text-white",
                        headerSubtitle: "text-gray-300",
                        socialButtonsBlockButton: "bg-white/10 border-white/20 text-white hover:bg-white/20",
                        formFieldLabel: "text-gray-300",
                        formFieldInput: "bg-white/10 border-white/20 text-white",
                        footerActionLink: "text-purple-400 hover:text-purple-300",
                    }
                }}
            />
        </div>
    );
}
