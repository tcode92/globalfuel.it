import { ClientFG, ClientState, ClientType, FileType, ROLES } from "@constants";
export type AuthActions = {
  /**
   * If present we should force password reset somehow.
   */
  rp?: boolean;
};
export namespace models {
  /**
   * This is the result of all db calls return types
   * Should be declared only here to use accross all the application.
   */
  export namespace auth {
    export type AuthCreateInput = {
      name: string;
      email: string;
      password: string;
      role: ROLES | null;
    };
    export type Auth = {
      id: number;
      email: string;
      password: string;
      role: "admin" | "agency";
      actions: AuthActions;
      name: string;
      rv: string | null;
    };
    export type StaffContact = { id: number; name: string; email: string };
  }
  export namespace client {
    type ClientAddress = {
      street: string;
      postalCode: string;
      province: string;
    };
    export type ClientDB = {
      id: number;
      code: string | null;
      address: ClientAddress;
      business_start: string | Date | null;
      auth_id: number;
      created_at: string;
      updated_at: string;
      cf: string | null;
      fg: ClientFG;
      state: ClientState;
      type: ClientType | null;
      sdi: string | null;
      fax: string | null;
      business: string;
      email: string;
      vat: string;
      phone: string;
      pec: string;
    };
    export type ClientCreateInput = {
      business: string;
      email: string;
      vat: string;
      phone: string;
      address: ClientAddress;
      pec: string;
      fg: ClientFG;
      state?: ClientState;
      type?: ClientType | null;
      sdi?: string | null;
      business_start?: string | Date | null;
      cf?: string | null;
      fax?: string | null;
    };
    export type ClientTable = {
      id: number;
      code: string | null;
      business: string;
      phone: string;
      email: string;
      agency_name: string;
      auth_id: number;
      state: ClientState;
      type: ClientType | null;
      vat: string;
    };
    export type FullClient = {
      address: ClientAddress;
      auth_id: number;
      code: string | null;
      business: string;
      business_start: string | null;
      cf: string | null;
      created_at: string;
      email: string;
      fax: string | null;
      fg: string;
      id: number;
      pec: string;
      phone: string;
      sdi: string | null;
      state: ClientState;
      type: ClientType | null;
      updated_at: string;
      vat: string;
      agency_name: string;
      docs: {
        [key in FileType]: {
          id: number;
          name: string;
          ext: string;
          src: string;
        }[];
      };
      note: {
        id: number;
        text: string;
        created_at: string | Date;
      }[];
    };
  }
  export namespace message {
    export type Message = {
      id: number;
      sender: string | null;
      agency_id: number | null;
      client: string;
      client_id: number;
      message: string;
      created_at: string;
      ack: boolean | null;
    };
    /* export type MessagePagination = {
      list: Message[];
      totalPages: number;
      currentPage: number;
      hasNext: boolean;
      hasPrev: boolean;
    }; */
    export type MessagePagination = {
      list: models.message.Message[];
      hasMore: boolean;
    };
  }
  export namespace note {
    export type Note = {
      id: number;
      text: string;
      created_at: string;
    };
  }
  export namespace agency {
    export type Agency = {
      id: number;
      name: string;
      email: string;
      clients: number;
    };
    export type AgencyDetails = {
      id: number;
      name: string;
      email: string;
      clients: number;
      states: {
        [key in ClientState]: string;
      };
      types: {
        [key in ClientType | "Nessun tipo"]: string;
      };
    };

    export type AgencyCreateInput = {
      name: string;
      email: string;
      password: string;
    };
    export type AgencyUpdateInput = {
      name?: string;
      email?: string;
      password?: string;
    };
  }
  export namespace staff {
    export type Staff = {
      id: number;
      email: string;
      name: string;
    };
  }
  export namespace dashboard {
    export type ClientStats = {
      state: ClientState;
      count: string;
    };
    export type ClientTypes = {
      type: ClientType | "Nessun tipo";
      count: string;
    };
  }
  export namespace file {
    export type Doc = {
      id: number;
      type: FileType;
      name: string;
      src: string;
      ext: string;
    };

    export type CreateFileInput = {
      name: string;
      src: string;
      ext: string;
      mime: string;
      type: FileType;
      clientId: number;
    };
  }
  export namespace mail {
    export type Mail = {
      id: number;
      from_address: string;
      to_address: string;
      subject: string;
      status: "pending" | "sent" | "failed";
      opened: number;
      retry_count: number;
      sent_at: string | null;
      created_at: string;
      updated_at: string;
    };
    export type Pagination = {
      data: Mail[];
      total: number;
      page: number;
      pageSize: number;
      totalPages: number;
    };
  }
}
