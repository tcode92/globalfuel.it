import { EmailSendData } from "../../emails/sendEmail";
import { dbConn, Sql } from "../connection";
import { CriticalError } from "../../utils/error";
import { models } from "./types";
import { MailSearchInput } from "@validation/mail";

const markMailOpen = async (trackId: string) => {
  await dbConn.query(
    `
    UPDATE email_queue
    SET 
        opened = opened + 1,
        first_open = COALESCE(first_open, CURRENT_TIMESTAMP)
    WHERE track_id = $1
    `,
    [trackId]
  );
};

const newEmail = async (mailData: {
  from_address: string;
  to_address: string;
  subject: string;
  template: EmailSendData["template"];
  body: EmailSendData["data"];
}) => {
  const query = `
    INSERT INTO email_queue (
      from_address,
      to_address,
      subject,
      body,
      template,
      status,
      created_at,
      updated_at,
      retry_count,
      opened
    ) 
    VALUES ($1, $2, $3, $4, $5, 'pending', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, 0) RETURNING id, track_id;
  `;

  const params = [
    mailData.from_address,
    mailData.to_address,
    mailData.subject,
    mailData.body,
    mailData.template,
  ];

  const result = await dbConn.query<{ id: number; track_id: string }>(
    query,
    params
  );
  if (result.rows[0]) {
    return {
      id: result.rows[0].id,
      trackId: result.rows[0].track_id,
    };
  }
  throw new CriticalError("Error creating email");
};

const markMailSent = async (id: number) => {
  const query = `
    UPDATE email_queue
    SET 
      status = 'sent',
      sent_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `;

  await dbConn.query(query, [id]);
};

const markMailError = async (id: number, errorMessage: string) => {
  const query = `
    UPDATE email_queue
    SET 
      status = 'failed',
      error_message = $2,
      retry_count = retry_count + 1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `;

  await dbConn.query(query, [id, errorMessage]);
};

const getEmailTableData = async (page: number, pageSize: number) => {
  const offset = (page - 1) * pageSize; // Calculate offset based on the page and page size

  const query = `
    SELECT 
      id,
      from_address,
      to_address,
      subject,
      status,
      opened,
      retry_count,
      sent_at,
      created_at,
      updated_at
    FROM email_queue
    ORDER BY created_at DESC
    LIMIT $1 OFFSET $2
  `;

  const result = await dbConn.query(query, [pageSize, offset]);
  return result.rows;
};

const getEmailTableWithPagination = async (query: MailSearchInput) => {
  const offset = (query.page - 1) * query.limit;
  const stm = new Sql();
  const countStm = new Sql();
  // Query for paginated data
  stm.add`
    SELECT 
      id,
      from_address,
      to_address,
      subject,
      status,
      opened,
      retry_count,
      sent_at,
      created_at,
      updated_at
    FROM email_queue
    
  `;

  // Query for total count
  countStm.add`
    SELECT COUNT(*) AS total
    FROM email_queue
  `;
  if (query.search) {
    stm.add`
    WHERE to_address ILIKE ${query.search + "%"} OR subject ILIKE ${query.search + "%"}
    `;
    countStm.add`
    WHERE to_address ILIKE ${query.search + "%"} OR subject ILIKE ${query.search + "%"}
    `;
  }
  stm.add`
  ORDER BY created_at DESC
  LIMIT ${query.limit} OFFSET ${offset}
  `;
  const dataPromise = stm.execute<models.mail.Mail>();
  const countPromise = countStm.execute();

  const [dataResult, countResult] = await Promise.all([
    dataPromise,
    countPromise,
  ]);

  return {
    data: dataResult.rows,
    total: parseInt(countResult.rows[0].total, 10),
    page: query.page,
    pageSize: query.limit,
    totalPages: Math.ceil(
      parseInt(countResult.rows[0].total, 10) / query.limit
    ),
  };
};

const incrementRetryCount = async (id: number) => {
  const query = `
    UPDATE email_queue
    SET 
      retry_count = retry_count + 1,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `;

  await dbConn.query(query, [id]);
};

const setRetryCount = async (id: number, retryCount: number) => {
  const query = `
    UPDATE email_queue
    SET 
      retry_count = $2,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `;

  await dbConn.query(query, [id, retryCount]);
};

export const mail = {
  markMailOpen,
  newEmail,
  markMailSent,
  markMailError,
  getEmailTableData,
  getEmailTableWithPagination,
  incrementRetryCount,
  setRetryCount,
};
