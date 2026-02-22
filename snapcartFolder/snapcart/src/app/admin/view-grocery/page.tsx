'use client'
import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Loader, Package, Pencil, Search, Upload, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { IGrocery } from '@/models/grocery.model'
import Image from 'next/image'
import { set } from 'mongoose'

const categories = [
  "Fruits and Vegetables",
  "Dairy and Eggs",
  "Rice,Atta and Grains",
  "Snacks and Biscuits",
  "Spices and Masalas",
  "Beverages and Drinks",
  "Personal Care",
  "HouseHold Supplies",
  "Instant and Packed Foods",
  "Baby and Pet Care"
]

const units = ["kg", "g", "litre", "ml", "piece", "pack"]


function ViewGrocery() {

  const [groceries, setGroceries] = useState<IGrocery[]>()
  const [editing, setEditing] = useState<IGrocery | null>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [backendImage, setBackendImage] = useState<Blob | null>(null);

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const router = useRouter()
  // api fetching groceries from server
  useEffect(() => {
    // Fetch grocery data from the server
    const getGroceries = async () => {
      try {
        const result = await axios.get("/api/admin/get-groceries")
        setGroceries(result.data)
      } catch (error) {
        console.log("Failed to fetch groceries", error)
      }
    }
    getGroceries()
  }, [])


  useEffect(() => {
    if (editing) {
      setImagePreview(editing.image);
    }
  }, [editing])


  const handleImageUpload=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0]
    if(file){
      setBackendImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  const handleEdit=async()=>{
    setLoading(true);
    if(!editing) return
    try{
      const formData=new FormData();
      formData.append("name",editing.name);
      formData.append("category",editing.category);
      formData.append("price",String(editing.price));
      formData.append("unit",editing.unit);
      formData.append("groceryId",String(editing._id.toString()));
      if(backendImage){
        formData.append("image",backendImage);
      }

      const result=await axios.post("/api/admin/edit-grocery",formData);
      setLoading(false);
     window.location.reload();
     setEditing(null);
    }catch(error){
      console.log("Error editing grocery:",error);
      setLoading(false);
    }
  }

  const handleDelete=async()=>{
    setDeleteLoading(true);
    if(!editing) return
    try{
      
      const result=await axios.post("/api/admin/delete-grocery",{groceryId:editing._id});
      window.location.reload();
      setEditing(null);
      setDeleteLoading(false);
    }catch(error){
      console.log("Error deleting grocery:",error);
      setDeleteLoading(false);
    }
  }
  return (
    <div className='pt-4 w-[95%] md:w-[85%] mx-auto pb-20'>


      {/* header containg title and back button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className='flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 text-center sm:text-left'
      >
        <button onClick={() => router.push("/")} className='flex items-center justify-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 font-semibold px-4 py-2 rounded-full transition w-full sm:w-auto'><ArrowLeft /><span>Back</span></button>
        <h1 className='text-2xl md:text-3xl font-extrabold text-green-700 flex items-center justify-center gap-2 '><Package size={28} className='text-green-600' />Manage Groceries</h1>

      </motion.div>

      {/* search bar */}
      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='flex items-center bg-white border border-gray-200 rounded-full px-5 py-3 shadow-sm mb-10 hover:shadow-lg transition-all max-w-lg mx-auto w-full'
      >
        <Search className='text-gray-500 w-5 h-5 mr-2' />
        <input type="text" className='w-full outline-none text-gray-700 placeholder-gray-400' placeholder='search by name or category...' />
      </motion.form>


      {/* mapping grocery */}

      <div className='space-y-4'>
        {groceries?.map((g, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 100 }}
            className='bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 transition-all'
          >
            {/* for image */}
            <div className='w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden border border-gray-200'>
              <Image
                src={g.image}
                alt={g.name}
                width={112}
                height={112}
                className='object-cover w-full h-full hover:scale-110 transition-transform duration-500' />
            </div>


            {/* for name and category(details) */}
            <div className='flex-1 flex flex-col justify-between w-full'>

              <div>
                <h3 className='font-semibold text-gray-800 text-lg truncate '>{g.name}</h3>
                <p className='text-gray-500 text-sm capitalize'>{g.category}</p>
              </div>

              <div className='mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2'>
                <p className='text-green-700 font-bold text-lg'>
                  ₹{g.price}/<span className='text-gray-500 text-sm font-medium ml-1'>{g.unit}</span>
                </p>
                <button className='bg-green-600 text-white px-4 py-2 rounded-lg text-font-semibold flex items-center justify-center gap-2 hover:bg-green-700 transition-all' onClick={() => setEditing(g)}>
                  <Pencil size={15} />Edit
                </button>
              </div>
            </div>

          </motion.div>
        ))}
      </div>


      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/10 flex items-center justify-center z-50 backdrop-blur-md px-4'
          >
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.3 }}
              className='bg-white rounded-2xl shadow-2xl w-full max-w-md p-5 relative'
            >
              <div className='flex justify-between items-center mb-3'>
                <h2 className='text-2xl font-bold text-green-700'>Edit Grocery</h2>
                <button className='text-gray-600 hover:text-red-600 p-2 ' onClick={() => setEditing(null)}>
                  <X size={18} />
                </button>

              </div>

              <div className="relative w-32 h-32 mx-auto mb-3 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                <label htmlFor="image-upload" className="absolute top-0 left-0 m-2 bg-white/80 rounded-full p-1 cursor-pointer flex items-center gap-1 text-gray-600 hover:text-green-700 shadow">
                  <Upload size={18} />
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                />
                {imagePreview && (
                  <Image
                    src={imagePreview}
                    alt="Image Preview"
                    width={128}
                    height={128}
                    className="object-contain w-full h-full"
                  />
                )}
              </div>
 
              <div className='space-y-3'>
                <input
                  type='text'
                  placeholder='enter grocery name'
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className='w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none '
                />

                <select className='w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none bg-white'
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                >
                  <option >Select Category</option>
                  {categories.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}

                </select>

                <input
                  type='text'
                  placeholder='Price'
                  value={String(editing.price)}
                  onChange={e => setEditing({ ...editing, price: e.target.value })}
                  className='w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none '
                />


                <select className='w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-green-500 outline-none bg-white'
                  value={editing.unit}
                  onChange={(e) => setEditing({ ...editing, unit: e.target.value })}
                >
                  <option >Select Unit</option>
                  {units.map((u, i) => (
                    <option key={i} value={u}>{u}</option>
                  ))}

                </select>


              </div>

              <div className='flex justify-end gap-3 mt-6'>
                <button className='px-4 py-2 rounded-lg bg-green-600 text-white flex items-center gap-2 hover:bg-green-700 transition-all' onClick={handleEdit} disabled={loading}>
                  {loading ? <Loader size={14}/> : "Edit Grocery"}</button>


                <button className='px-4 py-2 rounded-lg  bg-red-600 text-white flex items-center gap-2 hover:bg-red-700 transition-all' onClick={handleDelete} disabled={deleteLoading}>
                  {deleteLoading ? <Loader size={14}/> : "Delete Grocery"} </button>
              </div>

            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default ViewGrocery