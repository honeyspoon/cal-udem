import React from 'react';
import { Client } from './client.js';
import { load } from 'app/actions/save';

export default async function Page({ searchParams }) {
  const classParam = searchParams['classes'];
  let classes = JSON.parse(classParam || '{}');

  const saveId = searchParams['saveId'];

  if (saveId) {
    const res = await load(saveId);
    classes = res.class_data;
  }

  return (
    <div className="px-2">
      <Client defaultClasses={classes} />
    </div>
  );
}
