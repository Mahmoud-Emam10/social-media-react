import axios from "axios";
import PostCard from "../../Components/PostCard/PostCard";
import Sidebar from "../../Components/Sidebar/Sidebar";
import SuggestedFriends from "../../Components/SuggestedFriends/SuggestedFriends";
import { getUserFeed } from "../../services/feed.service";
import React, { useEffect, useState } from "react";
import type { PostCardI } from "../../types/PostCard.types";
import PostSkeleton from "../../Components/PostCard/PostSkeleton";
import CreatePost from "../../Components/PostCard/CreatePost";
import { useQuery } from "@tanstack/react-query";
import { data } from "react-router";

function Feed() {

  const {data, isLoading, isError, error} = useQuery({
    queryKey: ["getFeed"],
    queryFn: ()=> getUserFeed(),
    select:(data)=>data.data.posts as PostCardI[],
  })

  // const posts : PostCardI[] = data?.data.posts;
  
  

  // const [posts, setPosts] = useState<PostCardI[] | []>([]);
  // const [isLoading, setIsLoading] = useState(true);


  // async function getAllPosts() {
  //     try {
  //       const { data } = await getUserFeed();
  //       // console.log(data);
  //       setPosts(data.data.posts);
  //     } catch (error) {
  //       if (axios.isAxiosError(error)) {
  //         console.log(error.response?.data.message);
  //       }
  //     }finally{
  //       setIsLoading(false);
  //     }
  //   }

  // useEffect(() => {
  //   getAllPosts();
  // }, []);

  return (
    <div className="mt-3 mx-9 flex items-center justify-center">
      <title>Social App Newsfeed</title>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-2">
          <Sidebar />
        </div>
        <div className="col-span-7">
          <CreatePost />
          {isError ? <p className="text-red-800 text-center">{error.message}</p> :  isLoading ? <PostSkeleton/> : data?.map((post)=>{
            return <React.Fragment key={post._id}>
            <PostCard post={post}/>
            </React.Fragment>
          })}
          
        </div>
        <div className="col-span-3">
          <SuggestedFriends />
        </div>
      </div>
    </div>
  );
}

export default Feed;
