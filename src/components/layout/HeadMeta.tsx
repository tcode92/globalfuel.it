export const HeadMeta = ({ title }: { title?: string }) => {
  if (window !== undefined && title) {
    document.title = title;
  }
  return null;
};
