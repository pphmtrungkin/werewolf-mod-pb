import React, { useEffect, useRef, useState, useContext } from "react";
import { Outlet } from "react-router-dom";
import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../components/UserContext";

const Spinner = () => {
  return (
    <div className="flex justify-center items-center">
      <div role="status">
        <svg
          aria-hidden="true"
          class="w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  );
};
const SideBar = ({ selectedButton, setSelectedButton }) => {
  return (
    <div className="w-max">
      <ul className="justify-start list-none mt-12">
        <li className="mt-4">
          <button
            className={`hover:bg-white rounded-lg ${
              selectedButton === "Account" ? "bg-white" : null
            }`}
            type="button"
            onClick={() => setSelectedButton("Account")}
          >
            <p
              className={`p-4 hover:text-black transition text-lg ${
                selectedButton === "Account"
                  ? "font-bold text-black"
                  : "text-white font-medium"
              }`}
            >
              Account Settings
            </p>
          </button>
        </li>
        <li className="mt-4">
          <button
            className={`hover:bg-white rounded-lg ${
              selectedButton === "Password" ? "bg-white" : null
            }`}
            type="button"
            onClick={() => setSelectedButton("Password")}
          >
            <p
              className={`p-4 hover:text-black transition text-lg ${
                selectedButton === "Password"
                  ? "font-bold text-black"
                  : "text-white font-medium"
              }`}
            >
              Password
            </p>
          </button>
        </li>
      </ul>
    </div>
  );
};

const AccountSetting = ({ user }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState([]);
  const [imgPath, setImgPath] = useState("");
  const [fileUrl, setFileUrl] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  // variables for input check
  const [fullName, setFullName] = useState("");
  const fullNameRef = useRef(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [toggleDisable, setToggleDisable] = useState(true);

  const handleFocus = () => {
    setToggleDisable(false);
    setTimeout(() => {
      if (fullNameRef.current) {
        fullNameRef.current.focus();
      }
    }, 0);
  };
  useEffect(() => {
    async function getProfile() {
      const { data, error } = await supabase
        .from("profiles")
        .select(`username, full_name, phone, avatar_url`)
        .eq("id", user.id)
        .single();
      setLoading(true);
      if (error) {
        console.warn(error);
      } else if (data) {
        console.log(data);
        if (data.username) setUsername(data.username);
        setFullName(data.full_name);
        setEmail(user.email);
        if (data.phone) setPhoneNumber(data.phone);
        setAvatarUrl(data.avatar_url);
      }
      setLoading(false);
    }

    getProfile();
  }, []);

  const updateProfile = async (e) => {
    e.preventDefault();
    const { error } = await supabase
      .from("profiles")
      .update({
        username: username,
        full_name: fullName,
        phone: phoneNumber,
      })
      .eq("id", user.id);

    const { error: updateError } = await supabase.auth.updateUser({
      email: email,
      data: {
        username: username,
        full_name: fullName,
      },
    });
    setLoading(true);
    if (error || updateError) {
      console.log("Error updating user profile: ", error.message);
    } else {
      alert("Profile updated successfully");
    }
    setLoading(false);
  };

  const handleClose = () => {
   setIsOverlayOpen(false);
    setFileUrl(null);
  };
  const onImageChange = (e) => {
    let file = e.target.files[0];
    setImageFile(file);
    setFileUrl(URL.createObjectURL(file));
  };

  const updateProfileUrl = async (filePath) => {
    console.log(filePath);
    const { data } = supabase.storage
      .from("avatars")
      .getPublicUrl(`${filePath}`);
    if (data) {
      console.log(data.publicUrl);
      uploadImageUrlToProfile(data.publicUrl);
    } else {
      console.log(error.message);
    }
  };
  const uploadImageUrlToProfile = async (Url) => {
    console.log(Url);
    const { data, error } = await supabase.auth.updateUser({
      data: { avatar_url: Url },
    });
    const { updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: Url })
      .eq("id", user.id);
    if (error && updateError) {
      console.error("Error updating user profile: ", error);
    } else {
      setAvatarUrl(Url);
    }
  };
  const uploadPicture = async (e) => {
    e.preventDefault();
    const filename = `${user.id}/profile`;
    setImgPath(filename);
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(filename, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (data) {
      console.log(data.path);
      updateProfileUrl(data.path);
      handleClose();
    } else {
      console.log(error.message);
    }
  };

  const deleteAvatar = async () => {
    const imgPath = `${user.id}/profile`;
    console.log(imgPath);
    const { data: removeData, error } = await supabase.storage
      .from("avatars")
      .remove([imgPath]);
    if (error) {
      console.error("Error deleting image: ", error);
    } else {
      console.log("Image deleted successfully", removeData);
      setAvatarUrl("");
      const { error } = await supabase.auth.updateUser({
        data: { avatar_url: null },
      });
      const { updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: null })
        .eq("id", user.id);
      if (error && updateError) {
        console.error("Error updating user profile: ", error);
      }
    }
  };

  return (
    <div className="flex flex-col mt-12 gap-y-4">
      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="flex flex-row items-center gap-x-8">
            <div className="flex">
              {user && user.user_metadata.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  className="rounded-full object-cover w-32 h-32"
                />
              ) : (
                <div className="bg-white p-7 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="black"
                    className="w-12 h-12"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="block ml-4">
              <h3 className="font-semibold text-2xl">
                {username == "" ? fullName : "@" + username}
              </h3>
              <p className={`${username == "" ? "hidden" : "text-xl"}`}>
                {fullName}
              </p>
            </div>
            <div className="flex ml-8">
              <button
                type="button"
                title="Sign out"
                onClick={() => {
                  console.log("Sign out button clicked");
                  async function signOut() {
                    const { error } = await supabase.auth.signOut();
                    if (error) {
                      console.log("Sign out error:", error.message);
                    } else {
                      navigate("/login");
                    }
                  }
                  signOut();
                }}
                className={`bg-red-500 rounded-full transition p-2 hover:scale-125`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                  />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center flex-row gap-x-12 mt-4 image-control">
            <div>
              <button
                type="button"
                className="bg-blue-500 h-max p-2 px-4 rounded-lg"
                onClick={() => setIsOverlayOpen(true)}
              >
                <p className="text-white font-semibold">Upload new picture</p>
              </button>
            </div>
            <button
              type="button"
              className="bg-red-500 h-max p-2 px-3 rounded-lg"
              onClick={deleteAvatar}
            >
              <p className="font-semibold text-white">Delete</p>
            </button>
            <button
              onClick={handleFocus}
              className={`hover:bg-white rounded-full transition ${
                !toggleDisable && "bg-white"
              }`}
            >
              <svg
                className={`w-10 h-10 p-2 hover:text-gray-800  ${
                  !toggleDisable && "text-gray-800"
                } `}
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  d="M5 8a4 4 0 1 1 7.8 1.3l-2.5 2.5A4 4 0 0 1 5 8Zm4 5H7a4 4 0 0 0-4 4v1c0 1.1.9 2 2 2h2.2a3 3 0 0 1-.1-1.6l.6-3.4a3 3 0 0 1 .9-1.5L9 13Zm9-5a3 3 0 0 0-2 .9l-6 6a1 1 0 0 0-.3.5L9 18.8a1 1 0 0 0 1.2 1.2l3.4-.7c.2 0 .3-.1.5-.3l6-6a3 3 0 0 0-2-5Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div>
            {isOverlayOpen && 
            <div className="fixed inset-0 bg-[#231F20] bg-opacity-80 flex items-center justify-center z-40">
            <div className="flex flex-col items-center justify-center w-2/5 border-2 bg-[#231F20] dark:border-gray-600 rounded-lg z-50 p-8">
              <button
                className="self-end text-gray-500 dark:text-gray-400"
                onClick={() => setIsOverlayOpen(false)}
              >
                <svg
                  class="w-12 h-12 text-gray-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
              </button>
              <div>
                {fileUrl !== null ? (
                  <div className="w-80 h-80 rounded-full overflow-hidden my-8">
                    <img
                      src={fileUrl}
                      alt="preview"
                      className="w-80 h-80 object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <label
                    htmlFor="dropzone-file"
                    className="flex flex-col items-center justify-center w-80 h-80 border-2 border-gray-300 border-dashed rounded-full cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <svg
                        className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        SVG, PNG, JPG or GIF (MAX. 800x400px)
                      </p>
                    </div>
                    <input
                      id="dropzone-file"
                      type="file"
                      className="hidden"
                      onChange={onImageChange}
                    />
                  </label>
                )}
              </div>
              {fileUrl && (
                <div>
                  <button
                    className="w-96 h-12 my-8 bg-gray-500 text-white rounded-lg hover:bg-white hover:text-gray-800 text-lg font-semibold"
                    onClick={uploadPicture}
                  >
                    Upload
                  </button>
                </div>
              )}
            </div>
          </div>
            }
          </div>
          <fieldset disabled={toggleDisable}>
            <form onSubmit={(e) => updateProfile(e)}>
              <label htmlFor="fullName">Full Name</label>
              <input
                ref={fullNameRef}
                type="text"
                name="fullName"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <label htmlFor="username">Username</label>
              <input
                type="text"
                name="username"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="phone"
                name="phoneNumber"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              <input
                type="submit"
                value={"Update"}
                className="bg-blue-500 p-2 mt-6 border-none rounded-xl font-semibold uppercase hover:scale-110 transition"
              />
            </form>
          </fieldset>
        </>
      )}
    </div>
  );
};

const sendEmailPasswordReset = async (e, email) => {
  e.preventDefault();
  const isChecked = e.target.confirm.checked;
  if (!isChecked) {
    console.log("Please confirm to proceed");
  } else {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    console.log(data, error);
  }
};

const PasswordResetRedirect = ({ email }) => {
  return (
    <form onSubmit={(e) => sendEmailPasswordReset(e, email)} className="mt-16">
      <h1 className="text-xl font-semibold">
        An password reset link will be sent to your email:{" "}
        <span className="underline underline-offset-2">{email}</span>
      </h1>
      <div className="flex justify-center items-center my-4 mr-20">
        <input
          type="checkbox"
          className="w-5 h-5 hover:cursor-pointer"
          name="confirm"
          id="confirm"
        />
        <h3 className="text-white text-lg mx-2">
          I confirm and proceed to continue
        </h3>
      </div>
      <input
        type="submit"
        className="w-1/2 bg-blue-400 text-white text-2xl font-semibold p-4 border-none rounded-full hover:animate-pulse hover:cursor-pointer"
      />
    </form>
  );
};

const PasswordSetting = ({ user }) => {
  const [event, setEvent] = useState("");
  useEffect(() => {
    supabase.auth.onAuthStateChange((_event) => {
      setEvent(_event);
    });
  }, []);
  const email = user ? user.email : "";
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword === confirmPassword) {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    } else {
      console.log("Passwords do not match");
    }
  };
  return (
    <>
      {event === "PASSWORD_RECOVERY" ? (
        <form onSubmit={handleResetPassword} className="mt-14">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            name="username"
            id="username"
            autoComplete="username"
          />
          <label htmlFor="currentPassword">Current Password</label>
          <input
            autoComplete="current-password"
            type="password"
            name="currentPassword"
            id="currentPassword"
          />
          <label htmlFor="newPassword">New Password</label>
          <input
            autoComplete="new-password"
            type="password"
            name="newPassword"
            id="newPassword"
          />
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            autoComplete="new-password"
            type="password"
            name="confirmPassword"
            id="confirmPassword"
          />
          <input
            type="submit"
            className="bg-blue-500 p-2 w-1/3 mt-6 border-none rounded-xl hover:scale-110 transition"
          />
        </form>
      ) : (
        <PasswordResetRedirect email={email} />
      )}
    </>
  );
};
const Account = () => {
  const [selectedButton, setSelectedButton] = useState("Account");
  const { user } = useContext(UserContext);
  return (
    <div className="flex w-full mt-11">
      <Outlet />
      <div className="flex ml-40 flex-col justify-start">
        <SideBar
          selectedButton={selectedButton}
          setSelectedButton={setSelectedButton}
        />
      </div>
      <div className="flex flex-col ml-32 w-1/2">
        {selectedButton == "Account" && user ? (
          <AccountSetting key={user.id} user={user} />
        ) : (
          <PasswordSetting user={user} />
        )}
      </div>
    </div>
  );
};

export default Account;
