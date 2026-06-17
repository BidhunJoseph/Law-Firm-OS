import { getSignedDownloadUrl } from './src/server/actions/document-actions';

async function test() {
  const res = await getSignedDownloadUrl('752945aa-0dd8-4346-86fe-32048a094f1b/04bcd8a1-ff32-4af1-bbc3-2f509dee3ca7/1781710670675-Adobe_Scan_Feb_28__2026__5_.pdf');
  console.log(res);
}
test().catch(console.error);
