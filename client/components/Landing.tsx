import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import EncButton from "@/components/buttons/encrypt";
import Reveal from "./ui/Reveal";

export function Landing() {
  return (
    <div className="flex flex-col min-h-[100dvh] bg-white bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
      <header className="px-4 lg:px-6 h-14 flex items-center">
        <Link
          href="#"
          className="flex items-center justify-center"
          prefetch={false}
        >
          <LockIcon className="h-6 w-6 text-primary" />
          <span className="sr-only">Secure Cloud</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6 text-[#000]">
          <Link
            href="#features"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Features
          </Link>
          <Link
            href="#"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Pricing
          </Link>
          <Link
            href="#"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            About
          </Link>
          <Link
            href="#contact-us"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Contact
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="flex justify-center items-center h-screen w-full">
          <div className="container px-4 md:px-48">
            <div className="flex flex-col justify-center items-center text-center space-y-4">
              <div className="space-y-2 flex flex-col items-center">
                {/* <GradualSpacing
                  className="font-display text-center text-4xl font-bold tracking-[-0.1em] text-black dark:text-white md:text-7xl md:leading-[5rem]"
                  text="CryptoDrive"
                /> */}
                <Reveal>
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-7xl/none">
                    Secure Your Data with
                    <br />
                    Unbreakable Encryption
                  </h1>
                </Reveal>
                <Reveal>
                  <p className="max-w-[600px] text-[#000] md:text-xl">
                    Our cloud storage platform offers end-to-end encryption,
                    zero-knowledge architecture, and client-side encryption to
                    keep your data safe and private.
                  </p>
                </Reveal>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <EncButton />
              </div>
            </div>
          </div>
        </section>
        <section
          id="features"
          className="flex justify-center items-center w-full bg-muted"
        >
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-muted py-1 text-sm text-primary">
                    Easy to Use
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground">
                    Simplify Your Cloud Storage
                  </h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Our intuitive interface and seamless integration make it
                    easy to securely store, access, and share your files from
                    anywhere.
                  </p>
                </div>
                <ul className="grid gap-6">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <div>Drag-and-drop file uploads</div>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <div>Seamless mobile and desktop access</div>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <div>Secure file sharing with collaborators</div>
                  </li>
                </ul>
              </div>
              <img
                src="/placeholder.svg"
                alt="Image"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        <section className="flex justify-center items-center w-full pt-32">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <img
                src="/placeholder.svg"
                alt="Image"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              />
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-muted py-1 text-sm text-primary">
                    Unbreakable Encryption
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground">
                    Military-Grade Security for Your Data
                  </h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Our platform employs the latest encryption protocols,
                    including AES-256 and RSA, to ensure your data is protected
                    from unauthorized access.
                  </p>
                </div>
                <ul className="grid gap-6">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <div>End-to-end encryption</div>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <div>Zero-knowledge architecture</div>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <div>Client-side encryption</div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
        <section className="flex justify-center items-center w-full pt-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-block rounded-lg bg-muted py-1 text-sm text-primary">
                    Technical Specifications
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-foreground">
                    Robust Encryption Protocols
                  </h2>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Our platform utilizes the latest encryption algorithms and
                    key management techniques to ensure the highest level of
                    security for your data.
                  </p>
                </div>
                <ul className="grid gap-6">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <div>AES-256 encryption for data at rest</div>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <div>RSA-2048 encryption for data in transit</div>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <div>PBKDF2-SHA256 key derivation</div>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="h-5 w-5 text-primary" />
                    <div>Secure key storage and management</div>
                  </li>
                </ul>
              </div>
              <img
                src="/placeholder.svg"
                alt="Image"
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover object-center sm:w-full lg:order-last"
              />
            </div>
          </div>
        </section>
        <section
          id="contact-us"
          className="flex justify-center items-center w-full py-32 border-t"
        >
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight text-foreground">
                Join the Secure Cloud Revolution
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Experience the ultimate in cloud storage security and privacy.
                Sign up today and take control of your data.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <form className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="max-w-lg flex-1"
                />
                <Button type="submit">Sign Up</Button>
              </form>
              <p className="text-xs text-muted-foreground">
                By signing up, you agree to our{" "}
                <Link
                  href="#"
                  className="underline underline-offset-2"
                  prefetch={false}
                >
                  Terms of Service
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">
          &copy; 2024 Secure Cloud. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4 text-muted-foreground"
            prefetch={false}
          >
            Privacy Policy
          </Link>
          <Link
            href="#"
            className="text-xs hover:underline underline-offset-4 text-muted-foreground"
            prefetch={false}
          >
            Security
          </Link>
        </nav>
      </footer>
    </div>
  );
}

function CheckIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function LockIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}
