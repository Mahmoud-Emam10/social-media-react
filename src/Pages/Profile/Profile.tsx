import { useContext } from "react";
import { Mail, Sparkles } from "lucide-react";
import { UserContext, type UserContextType } from "../../Components/Context/UserContext";
import MyPosts from "../../Components/Profile/MyPosts";

function Profile() {
  const { userDetails }: UserContextType = useContext(UserContext);

  return (
    <>
      {userDetails && (
        <main className="min-h-screen bg-sec py-6">
          <div className="container mx-auto max-w-6xl px-4">
            <title>Social App Profile</title>
            <section className="relative">
              <div className="h-36 rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-700 sm:h-44" />

              <div className="relative mx-2 -mt-16 rounded-3xl bg-white p-5 shadow-sm sm:mx-4 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src={userDetails.photo}
                      alt={userDetails.name}
                      className="size-24 shrink-0 rounded-full object-cover ring-4 ring-white sm:size-28"
                    />
                    <div>
                      <h1 className="text-2xl font-bold capitalize text-gray-900">
                        {userDetails.name}
                      </h1>
                      <p className="text-sm text-gray-500">{userDetails?.username}</p>
                      <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600">
                        <Sparkles size={12} />
                        Route Posts member
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 lg:min-w-80">
                    <div className="rounded-2xl bg-slate-50 px-3 py-3 text-center">
                      <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
                        Followers
                      </p>
                      <p className="mt-1 text-xl font-bold text-gray-900">
                        {userDetails.followersCount}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-3 text-center">
                      <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
                        Following
                      </p>
                      <p className="mt-1 text-xl font-bold text-gray-900">
                        {userDetails.followingCount}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-3 text-center">
                      <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
                        Bookmarks
                      </p>
                      <p className="mt-1 text-xl font-bold text-gray-900">
                        {userDetails.bookmarksCount}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <h2 className="text-sm font-semibold text-gray-900">About</h2>
                    <p className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                      <Mail size={16} className="text-gray-400" />
                      {userDetails.email}
                    </p>
                    <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <Sparkles size={16} className="text-gray-400" />
                      Active on Route Posts
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-[10px] font-semibold tracking-wide text-gray-400 uppercase">
                      Joined
                    </p>
                    <p className="mt-1 text-sm font-bold text-gray-900">
                      {new Date(userDetails.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-6">
              <MyPosts userId={userDetails._id} title="My Posts" />
            </div>
          </div>
        </main>
      )}
    </>
  );
}

export default Profile;
