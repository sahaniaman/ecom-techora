import getAllUsers from "@/data/users/superadmin/getAllUsers"

const page = async () => {
    const users = await getAllUsers()
        console.log("users", users)
  return (
    <div>
      
    </div>
  )
}

export default page
