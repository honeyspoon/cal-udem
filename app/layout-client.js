'use client';

import React from 'react';

import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from '@nextui-org/react';
import { Providers } from 'app/providers';

import Link from 'next/link';

export function LayoutClient({ children }) {
  return (
    <>
      <Navbar>
        <NavbarBrand>
          <p className="font-bold text-inherit">caludem</p>
        </NavbarBrand>
        <NavbarContent
          className="hidden sm:flex gap-4"
          justify="center"
        >
          {/* <NavbarItem isActive> */}
          {/*   <Link */}
          {/*     className='text-blue-400' */}
          {/*     href='/programmes'> */}
          {/*     programmes */}
          {/*   </Link> */}
          {/* </NavbarItem> */}
          <NavbarItem isActive>
            <Link
              className="text-blue-400"
              href="/"
            >
              Horaire
            </Link>
          </NavbarItem>
        </NavbarContent>
        <NavbarContent justify="end">
          {/* <NavbarItem> */}
          {/*   <Button as={Link} color="primary" href="#" variant="flat"> */}
          {/*     login */}
          {/*   </Button> */}
          {/* </NavbarItem> */}
        </NavbarContent>
      </Navbar>

      <Providers>{children}</Providers>
    </>
  );
}
