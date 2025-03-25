// "use client";

// import { LangIcon } from "@/assets";
// import useLanguage from "@/hooks/useLanguage";
// import { useRedux } from "@/hooks/useRedux";
// import { logout } from "@/state/slices/userSlice";
// import { RootState } from "@/state/store";
// import Image from "next/image";
// import { useRouter } from "next/navigation";
// import React, { useState } from "react";
// import { useTranslation } from "react-i18next";
// import { useSelector } from "react-redux";
// import GridContainer from "../atoms/GridContainer";

// const Header: React.FC = () => {
//   const user = useSelector((state: RootState) => state.user.userInfo);
//   const { dispatch } = useRedux((state) => state.user);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const router = useRouter();
//   const { t } = useTranslation();
//   const { toggleLanguage } = useLanguage();

//   const userInitial = user ? user.name.charAt(0).toUpperCase() : "G";
//   const toggleDropdown = () => {
//     setIsDropdownOpen(!isDropdownOpen);
//   };

//   const handleProfile = () => {
//     console.log("Profile clicked");
//     setIsDropdownOpen(false);
//   };

//   return (
//     <GridContainer>
//       <header className="flex justify-between items-center flex-col gap-[15px] sm:flex-row col-span-4 sm:col-span-12 bg-white py-[24px] ">
//         <div className="flex items-center space-x-3">
//           <div
//             className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 cursor-pointer ml-3"
//             onClick={() => router.push("/home")}
//           >
//             <FaHome className="text-[#1b1a40]" />
//           </div>

//           <div className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 cursor-pointer">
//             <FaTh className="text-[#1b1a40]" />
//           </div>

//           <div className="bg-slate-100 rounded-md shadow-sm p-2 flex">
//             <input
//               type="search"
//               name="search-text"
//               placeholder={t("Search")}
//               className="border-none outline-none bg-transparent px-1"
//             />
//           </div>
//         </div>

//         <div className="flex items-center space-x-3">
//           <div className="relative p-2 bg-blue-100 rounded-full hover:bg-blue-200 cursor-pointer ml-3">
//             <FaBell className="text-[#1b1a40]" />
//             <span className="absolute top-0 right-0 h-2 w-2 bg-green-500 rounded-full"></span>
//           </div>

//           <div className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 cursor-pointer">
//             <FaQuestionCircle className="text-[#1b1a40]" />
//           </div>

//           <div className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 cursor-pointer">
//             <FaCog className="text-[#1b1a40]" />
//           </div>

//           <div
//             className="p-2 bg-blue-100 rounded-full hover:bg-blue-200 cursor-pointer"
//             onClick={toggleLanguage}
//           >
//             <Image src={LangIcon} width={16} height={16} alt="language icon" />
//           </div>

//           <div
//             className="h-8 w-8 flex items-center justify-center rounded-full bg-red-300 cursor-pointer text-twhite font-bold text-lg"
//             onClick={toggleDropdown}
//           >
//             {userInitial}
//           </div>

//           {isDropdownOpen && (
//             <div className="absolute top-[20px] z-10 mt-12 w-32 bg-white shadow-md rounded-lg border border-gray-200">
//               <ul className="flex flex-col text-tblack">
//                 <li
//                   onClick={handleProfile}
//                   className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                 >
//                   {t("Profile")}
//                 </li>
//                 <li
//                   onClick={() => {
//                     dispatch(logout());
//                     router.replace("/");
//                   }}
//                   className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
//                 >
//                   {t("Logout")}
//                 </li>
//               </ul>
//             </div>
//           )}
//         </div>
//       </header>
//     </GridContainer>
//   );
// };

// export default Header;
