import slugify from 'slugify';

export const generateSlug = (title: string): string =>
  slugify(title, { lower: true, strict: true, trim: true });

export const generateUniqueSlug = async (
  title: string,
  checkExists: (slug: string) => Promise<boolean>
): Promise<string> => {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug)) {
    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
};
