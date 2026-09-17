export function createPageUrl(pageNameAndQuery) {
  const [pageName, query] = pageNameAndQuery.split('?');
  return '/' + pageName + (query ? '?' + query : '');
}
