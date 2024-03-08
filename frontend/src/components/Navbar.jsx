/* eslint-disable jsx-a11y/anchor-is-valid */
import React from "react";
import { ReactComponent as Logo } from "../assets/Logo-wh.svg";
import { ReactComponent as Profile } from "../assets/Profile.svg";
import ThemeSwitcher from "./ThemeSwitcher";
import { isAuthenticated } from "../utils/auth";
import { logout } from "../utils/logout";
import { user_role } from "../utils/user_role";

function Navbar() {
  const openMenu = () => {
    let menu = document.getElementById("user-menu-button");
    menu.hidden ? (menu.hidden = false) : (menu.hidden = true);
  };

  let currentPage = window.location.pathname;
  const pageStyle =
    "text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium";

  return (
    <>
      <nav className={"bg-gray-800"}>
        <div className={"mx-auto max-w-7xl px-2 sm:px-6 lg:px-8"}>
          <div className={"relative flex h-16 items-center justify-between"}>
            <div
              className={
                "absolute inset-y-0 left-0 flex items-center sm:hidden"
              }
            >
              <button
                type={"button"}
                className={
                  "relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                }
                aria-controls={"mobile-menu"}
                aria-expanded={"false"}
              >
                <span className={"absolute -inset-0.5"}></span>
                <span className={"sr-only"}>Open main menu</span>

                <svg
                  className={"block h-6 w-6"}
                  fill={"none"}
                  viewBox={"0 0 24 24"}
                  strokeWidth={"1.5"}
                  stroke={"currentColor"}
                  aria-hidden={"true"}
                >
                  <path
                    strokeLinecap={"round"}
                    strokeLinejoin={"round"}
                    d={"M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"}
                  />
                </svg>

                <svg
                  className={"hidden h-6 w-6"}
                  fill={"none"}
                  viewBox={"0 0 24 24"}
                  strokeWidth={"1.5"}
                  stroke={"currentColor"}
                  aria-hidden={"true"}
                >
                  <path
                    strokeLinecap={"round"}
                    strokeLinejoin={"round"}
                    d={"M6 18L18 6M6 6l12 12"}
                  />
                </svg>
              </button>
            </div>
            <div
              className={
                "flex flex-1 items-center justify-center sm:items-stretch sm:justify-start"
              }
            >
              <div className={"flex flex-shrink-0 items-center"}>
                <a href="/">
                  <Logo className="h-8 w-auto" />
                </a>
              </div>
              <div className="hidden sm:ml-6 sm:block">
                <div className="flex space-x-4">
                  <a
                    href="/dashboard"
                    className={
                      currentPage === "/dashboard"
                        ? "bg-gray-900 " + pageStyle
                        : pageStyle
                    }
                  >
                    Dashboard
                  </a>
                  {user_role() === "patient" ? (
                    <a
                      href="/diary"
                      className={
                        currentPage === "/diary"
                          ? "bg-gray-900 " + pageStyle
                          : pageStyle
                      }
                    >
                      {"Diary"}
                    </a>
                  ) : (
                    <a
                      href="/simulate-model"
                      className={
                        currentPage === "/simulate-model"
                          ? "bg-gray-900 " + pageStyle
                          : pageStyle
                      }
                    >
                      {"Model"}
                    </a>
                  )}

                  <a
                    href="#"
                    className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                  >
                    {isAuthenticated() ? "AUTHENTICATED" : "NOT"}
                  </a>
                  <a
                    href="#"
                    className="text-gray-300 hover:bg-gray-700 hover:text-white rounded-md px-3 py-2 text-sm font-medium"
                  >
                    {user_role()}
                  </a>
                </div>
              </div>
            </div>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
              {/* <button
                type="button"
                className="relative rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                <span className="absolute -inset-1.5"></span>
                <span className="sr-only">View notifications</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
                  />
                </svg>
              </button> */}
              <ThemeSwitcher className="h-8 w-8 rounded-full" />

              <div className="relative ml-3">
                <div>
                  <button
                    type="button"
                    className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                    aria-expanded="false"
                    aria-haspopup="true"
                    onClick={openMenu}
                  >
                    <span className="absolute -inset-1.5"></span>
                    <span className="sr-only">Open user menu</span>
                    <Profile className="h-8 w-8 rounded-full" />
                  </button>
                </div>

                <div
                  hidden={true}
                  className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md shadow bg-white dark:border dark:bg-gray-800 dark:border-gray-700 py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                  tabIndex="-1"
                  id="user-menu-button"
                >
                  {isAuthenticated() ? (
                    <>
                      <a
                        href="/profile"
                        className="block px-4 py-2 text-sm font-medium text-gray-800 dark:text-white"
                        role="menuitem"
                        tabIndex="-1"
                        id="user-menu-item-1"
                      >
                        Profile
                      </a>
                      <a
                        href="/"
                        className="block px-4 py-2 text-sm font-medium text-gray-800 dark:text-white"
                        role="menuitem"
                        tabIndex="-1"
                        id="user-menu-item-2" // Ensure unique ID
                        onClick={logout}
                      >
                        Logout
                      </a>
                    </>
                  ) : (
                    <>
                      <a
                        href="/login"
                        className="block px-4 py-2 text-sm font-medium text-gray-800 dark:text-white"
                        role="menuitem"
                        tabIndex="-1"
                        id="user-menu-item-0"
                      >
                        Login
                      </a>
                      <a
                        href="/register"
                        className="block px-4 py-2 text-sm font-medium text-gray-800 dark:text-white"
                        role="menuitem"
                        tabIndex="-1"
                        id="user-menu-item-1"
                      >
                        Register
                      </a>
                    </>
                  )}
                </div>

                {/* <div
                  hidden={true}
                  className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="user-menu-button"
                  tabIndex="-1"
                  id="user-menu-button"
                >
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700"
                    role="menuitem"
                    tabIndex="-1"
                    id="user-menu-item-0"
                  >
                    Your Profile
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700"
                    role="menuitem"
                    tabIndex="-1"
                    id="user-menu-item-1"
                  >
                    Settings
                  </a>
                  <a
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700"
                    role="menuitem"
                    tabIndex="-1"
                    id="user-menu-item-2"
                  >
                    Sign out
                  </a>
                </div> */}
              </div>
            </div>
          </div>
        </div>

        <div className={"sm:hidden"} id={"mobile-menu"}>
          <div className={"space-y-1 px-2 pb-3 pt-2"}>
            <a
              href={"/"}
              className={
                currentPage === "/" ? "bg-gray-900" + pageStyle : pageStyle
              }
              aria-current={"page"}
            >
              Dashboard
            </a>
            <a
              href={"/"}
              className={
                "text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
              }
            >
              DASHBOARD
            </a>
            <a
              href={"/"}
              className={
                "text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
              }
            >
              Projects
            </a>
            <a
              href={"/"}
              className={
                "text-gray-300 hover:bg-gray-700 hover:text-white block rounded-md px-3 py-2 text-base font-medium"
              }
            >
              Calendar
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
