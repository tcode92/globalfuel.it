"use client";

import EmailTable from "../email/Table";
import DefaultMain from "../layout/DefaultMain";
import { Protected } from "../layout/Protected";

export const EmailPage = () => {
  return (
    <Protected role="admin">
      <DefaultMain>
        <EmailTable />
      </DefaultMain>
    </Protected>
  );
};
