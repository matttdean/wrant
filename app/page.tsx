import DocumentList from '@/components/document-list'
import Editor from '@/components/editor'
import Header from '@/components/header'
import SectionDivider from '@/components/section-divider'

export default function Home() {
  return (
    <main className="flex items-center flex-col">
      <Header />
      <SectionDivider />
      {/* context provider */}
      <Editor />
      {/* documentlist */}
      {/* /context provider */}
    </main>
  )
}
