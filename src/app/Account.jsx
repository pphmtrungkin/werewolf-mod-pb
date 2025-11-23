import React, { useEffect, useRef, useState, useContext } from "react";
import { Outlet } from "react-router";
import { useNavigate } from "react-router";
import pb from "../pocketbase";
import { UserContext } from "../components/UserContext";
import { Switch, Tooltip, FormControlLabel } from "@mui/material";
import { Typography, Box, Tabs, Tab } from "@mui/material";
import PropTypes from 'prop-types';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const AccountSetting = ({ user }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState([]);
  const [imgPath, setImgPath] = useState("");
  const [fileUrl, setFileUrl] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isOverlayOpen, setIsOverlayOpen] = useState(false);

  // variables for input check
  // Put them all in a FormData object when submitting
  const [formData, setFormData] = useState({});
  const fullNameRef = useRef(null);
  const [toggleDisable, setToggleDisable] = useState(true);

  const handleFocus = () => {
    setToggleDisable(!toggleDisable);
    if (toggleDisable) {
      fullNameRef.current.focus();
    }
  };

   useEffect(() => {
    async function getProfile() {
      const userId = pb.authStore.model.id;
      const record = await pb.collection("users").getOne(userId);
      setFormData({
        fullName: record.full_name || "",
        username: record.name || "",
        email: record.email || "",
        phoneNumber: record.phone || "",
      });
    }
    
    getProfile();
  }, []);

  const updateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    const record = await pb.collection("users").update('RECORD_ID', formData);
    if (record.status) {
      console.error("Error updating profile: ", record.status, record.message);
      alert("Error updating profile");
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
    console.log(file);
  };

  const updateProfileUrl = async (filePath) => {
    console.log(filePath);
  };
  const uploadImageUrlToProfile = async (Url) => {
    console.log(Url);
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
    if (error) {
      console.error("Error deleting image: ", error);
    } else {
      console.log("Image deleted successfully", removeData);
      setAvatarUrl("");
      if (error && updateError) {
        console.error("Error updating user profile: ", error);
      }
    }
  };

  return (
    <div className="flex flex-col gap-y-4 mx-6">
      {loading ? (
        <Spinner />
      ) : (
        <>
          <div className="flex flex-row items-center gap-x-8">
            <div className="flex">
              {user ? (
                <img
                  src={import.meta.env.VITE_POCKETBASE_URL + '/api/files/users/' + user.id + '/' + user.avatar}
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
                {formData.username == "" ? formData.fullName : "@" + formData.username}
              </h3>
              <p className={`${formData.username == "" ? "hidden" : "text-xl"}`}>
                {formData.fullName}
              </p>
            </div>
            <div className="flex ml-8">
              <button
                type="button"
                title="Sign out"
                onClick={() => {
                  console.log("Sign out button clicked");
                  async function signOut() {
                    await pb.authStore.clear();
                    navigate("/");
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
              <FormControlLabel
                control={
                  <Switch
                    checked={!toggleDisable}
                    onChange={handleFocus}
                    color="secondary"
                    inputProps={{ 'aria-label': 'toggle disable' }}
                  />
                }
                label="Edit User Info"
              />
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
                  className="w-12 h-12 text-gray-800 dark:text-white"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
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
                value={formData.fullName ?? ""}
                // save full name to formData
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                className={`py-3 border-b-2 w-full focus:outline-none focus:ring-0 focus:border-blue-500 mb-4 ${toggleDisable ? "cursor-not-allowed opacity-50" : ""}` }
              />
              <label htmlFor="username">Username</label>
              <input
                type="text"
                name="username"
                id="username"
                value={formData.username ?? ""}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                 className={`py-3 border-b-2 w-full focus:outline-none focus:ring-0 focus:border-blue-500 mb-4 ${toggleDisable ? "cursor-not-allowed opacity-50" : ""}` }

              />
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={formData.email ?? ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`py-3 border-b-2 w-full focus:outline-none focus:ring-0 focus:border-blue-500 mb-4 ${toggleDisable ? "cursor-not-allowed opacity-50" : ""}` }  
              />
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="phone"
                name="phoneNumber"
                id="phoneNumber"
                value={formData.phoneNumber ?? ""}
                onChange={(e) => setPhoneNumber(e.target.value)}
                  className={`py-3 border-b-2 w-full focus:outline-none focus:ring-0 focus:border-blue-500 mb-4 ${toggleDisable ? "cursor-not-allowed opacity-50" : ""}` }
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
  const email = user ? user.email : "";
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword === confirmPassword) {
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
  const [value, setValue] = useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const { user } = useContext(UserContext);

  return (
    <Box
      sx={{ bgcolor: 'background.paper', display: 'flex', marginTop: 16 }}
    >
      <Tabs
        orientation="vertical"
        value={value}
        onChange={handleChange}
        aria-label="Vertical tabs example"
        sx={{ borderRight: 1, borderColor: 'divider', minWidth: '160px' }}
      >
        <Tab  label="Item One" {...a11yProps(0)} />
        <Tab  label="Item Two" {...a11yProps(1)} />
      </Tabs>
      <TabPanel value={value} index={0}>
        <AccountSetting user={user} />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <PasswordSetting user={user} />  
      </TabPanel>
    </Box>
  );
};

export default Account;
