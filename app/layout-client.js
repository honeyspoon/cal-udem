'use client';

import React from 'react';

import { Navbar, NavbarBrand, NavbarContent, NavbarItem, Link } from '@nextui-org/react';
import { Providers } from 'app/providers';

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
          <NavbarItem isActive>
            <Link aria-current="page">Horaire</Link>
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
