"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

interface Booking {
 id: string;
 booking_date: string;
 number_of_people: number;
 total_price: number;
 status: "pending" | "confirmed" | "completed" | "cancelled";
 tours: {
   title: string;
   currency: string;
   provider_id: string;
 };
}

type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export default function ProviderBookings() {
 const [bookings, setBookings] = useState<Booking[]>([]);
 const [loading, setLoading] = useState(true);
 const [statusMessage, setStatusMessage] = useState("");
 const supabase = createClient();

 const fetchBookings = useCallback(async () => {
   try {
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) {
       setLoading(false);
       return;
     }

     const { data, error } = await supabase
  .from("bookings")
  .select(`
    *,
    tours!inner (
      title,
      currency,
      provider_id
    )
  `)
  .eq("provider_id", user.id);

     console.log('Fetched data:', data);
     console.log('Error if any:', error);

     if (data) setBookings(data);
   } catch (error) {
     console.error("Error:", error);
   } finally {
     setLoading(false);
   }
 }, [supabase]);

 useEffect(() => {
   fetchBookings();
 }, [fetchBookings]);

 const updateBookingStatus = async (bookingId: string, newStatus: BookingStatus) => {
  try {
    setLoading(true);
    
    const { data, error } = await supabase
      .from("bookings")
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select();
    
    console.log('Update attempt:', {
      bookingId,
      newStatus,
      response: { data, error }
    });
    
    if (error) throw error;
    await fetchBookings();
    setStatusMessage(`Updated to ${newStatus}`);
  } catch (error) {
    console.error("Error:", error);
    setStatusMessage("Update failed");
  } finally {
    setLoading(false);
  }
};

 const getStatusButtons = (booking: Booking) => {
   switch (booking.status) {
     case "pending":
       return (
         <>
           <button
             onClick={() => updateBookingStatus(booking.id, "confirmed")}
             disabled={loading}
             className="px-3 py-1 text-sm font-medium text-white bg-teal-600 rounded hover:bg-teal-700 transition-colors disabled:opacity-50"
           >
             Confirm
           </button>
           <button
             onClick={() => updateBookingStatus(booking.id, "cancelled")}
             disabled={loading}
             className="px-3 py-1 text-sm font-medium text-white bg-slate-400 rounded hover:bg-slate-500 transition-colors disabled:opacity-50"
           >
             Cancel
           </button>
         </>
       );

     case "confirmed":
       return (
         <button
           onClick={() => updateBookingStatus(booking.id, "completed")}
           disabled={loading}
           className="px-3 py-1 text-sm font-medium text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors disabled:opacity-50"
         >
           Complete
         </button>
       );

     default:
       return null;
   }
 };

 if (loading) return <div>Loading...</div>;

 return (
   <div className="max-w-6xl mx-auto px-4 py-8">
     <h1 className="text-2xl font-bold mb-6">Booking Management</h1>

     <div className="grid gap-4">
       {bookings.map((booking) => (
         <div key={booking.id} className="bg-white p-6 rounded-lg shadow">
           <div className="flex justify-between items-start">
             <div>
               <h3 className="text-lg font-semibold">{booking.tours?.title || 'Untitled Tour'}</h3>
               <div className="mt-2 space-y-1 text-sm text-gray-600">
                 <p>Date: {new Date(booking.booking_date).toLocaleDateString()}</p>
                 <p>Guests: {booking.number_of_people}</p>
                 <p>Total: {booking.tours?.currency || '$'} {booking.total_price}</p>
                 <p>Status: {" "}
                   <span className={`capitalize font-medium ${
                     booking.status === "pending" ? "text-amber-600" :
                     booking.status === "confirmed" ? "text-teal-600" :
                     booking.status === "completed" ? "text-indigo-600" : "text-slate-500"
                   }`}>
                     {booking.status}
                   </span>
                 </p>
               </div>
             </div>

             <div className="space-x-2">
               {getStatusButtons(booking)}
             </div>
           </div>
         </div>
       ))}

       {bookings.length === 0 && (
         <div className="text-center py-8 text-gray-500">No bookings found</div>
       )}
     </div>

     {statusMessage && (
       <div className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded shadow-lg">
         {statusMessage}
       </div>
     )}
   </div>
 );
}