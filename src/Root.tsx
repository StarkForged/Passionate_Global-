/** Page switch shared by the browser entry (main.tsx) and the pre-render entry (entry-server.tsx). */
import App from './App';
import { LegalPage, NotFound } from './pages/SubPages';
import { PageContext, type PageId } from './lib/page';

export default function Root({ page }: { page: PageId }) {
  return (
    <PageContext.Provider value={page}>
      {page === 'home' ? <App /> : page === 'notfound' ? <NotFound /> : <LegalPage page={page} />}
    </PageContext.Provider>
  );
}
