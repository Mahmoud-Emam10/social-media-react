import axios from 'axios'
import React, { useEffect, useState } from 'react'

export default function useGet(apiLink: string | null) {
    const [myData, setMyData] = useState<string | null>(null)

    async function getData(apiLink:string) {
        try {
            
            const {data} = await axios.get(apiLink , {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("userToken")}`
                }
            })

            setMyData(data);
        } catch (error) {
            console.log(error);
            
        }
    }

    useEffect(()=>{
        getData(apiLink);
    },[apiLink])

  return myData ;
}
