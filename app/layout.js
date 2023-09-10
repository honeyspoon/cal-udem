import React from 'react';
import Image from 'next/image';
import 'styles/globals.css';

import { LayoutClient } from './layout-client';

export const metadata = {
  title: 'Calendrier udem',
  description: 'Welcome to Next.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <LayoutClient>{children}</LayoutClient>
        <Footer />
      </body>
    </html>
  );
}

function Footer() {
  return (
    <div className="max-w-2xl mx-auto">
      <footer className="p-4 bg-white sm:p-6 ">
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 sm:text-center ">
            © 2023 Abderahmane Bouziane
          </span>
          <div className="flex mt-4 space-x-6 sm:justify-center sm:mt-0">
            <form
              action="https://www.paypal.com/donate"
              method="post"
              target="_top"
            >
              <input
                type="hidden"
                name="hosted_button_id"
                value="K7SBBRXE3W3NA"
              />
              <input
                type="image"
                src="https://www.paypalobjects.com/fr_CA/i/btn/btn_donate_SM.gif"
                border="0"
                name="submit"
                title="PayPal - The safer, easier way to pay online!"
                alt="Bouton Faire un don avec PayPal"
              />
              <Image
                alt=""
                border="0"
                src="https://www.paypal.com/fr_CA/i/scr/pixel.gif"
                width="1"
                height="1"
              />
            </form>
          </div>
        </div>
      </footer>
    </div>
  );
}
