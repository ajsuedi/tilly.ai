// Root of the Next.js app — sends visitors straight into the CRM.
// The prototype lives in public/ as static assets; views migrate to React incrementally.
export default function Home() {
  return null;
}

export async function getServerSideProps() {
  return { redirect: { destination: '/app/index.html', permanent: false } };
}
