const AUTHOR_URL_SUFFIX_PATTERN = /\s*\(https?:\/\/.*\)$/

const getAuthorSource = (author: string): string => {
  return author.replace(AUTHOR_URL_SUFFIX_PATTERN, '')
}

export const parseAuthorNames = (author: string): string[] => {
  return getAuthorSource(author)
    .split(/,\s*/)
    .map(name => name.trim())
    .filter(Boolean)
}

export const formatAuthorNames = (author: string): string => {
  return parseAuthorNames(author).join('、')
}

export const pluginHasAuthor = (pluginAuthor: string, authorName: string): boolean => {
  const normalizedAuthor = authorName.trim().toLowerCase()
  if (!normalizedAuthor) return false

  return parseAuthorNames(pluginAuthor).some(name => name.toLowerCase() === normalizedAuthor)
}
