import React from 'react'
import HeroSection from './HeroSection'
import CategorySlider from './CategorySlider'
import connectDb from '@/lib/db'
import { IGrocery } from '@/models/grocery.model';
import GroceryItemCard, { GroceryItem } from './GroceryItemCard';
import RecipeCartAssistant from './RecipeCartAssistant';

 async function UserDashboard({groceryList}:{groceryList:IGrocery[]}) {
  await connectDb();
const plainGroceryList=JSON.parse(JSON.stringify(groceryList)) as GroceryItem[]

  return (
    <>
      <HeroSection/>
      <CategorySlider/>
      <RecipeCartAssistant/>
      <div className='w-[90%] md:w-[80%] mx-auto mt-10'>
        <h2 className='text-2xl md:text-3xl font-bold text-green-700 mb-6 text-center '>Popular Grocery Items</h2>
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 '>
      {plainGroceryList.map((item)=>(
      <GroceryItemCard key={item._id} item={item}/>
      
      ))}
      </div>
      </div>
    </>
  )
}

export default UserDashboard
