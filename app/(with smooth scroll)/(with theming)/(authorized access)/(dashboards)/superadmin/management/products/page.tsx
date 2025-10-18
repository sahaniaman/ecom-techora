import ProductPage from '@/components/pages/ProductPage'
import { getCurrentUser } from '@/lib/auth'

const PPage = async () => {
const currentUser = await getCurrentUser()
console.log("currentUser:::::", currentUser)
  return (
    <div>
      <ProductPage />
    </div>
  )
}

export default PPage
