import React, { ReactNode } from "react";

export default function Modal(props: { title: ReactNode, children: ReactNode, open: boolean, setOpen: (open: boolean) => void, buttons?: ReactNode }) {
    const {open, setOpen} = props;
    return (
        <>
            {open ? (
                <>
                    <div
                        className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none"
                        /* onClick={() => setOpen(false)} */
                        role="dialog"
                    >
                        <div className="relative w-auto my-6 mx-auto max-w-3xl">
                            {/*content*/}
                            <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white dark:bg-gray-800 outline-none focus:outline-none">
                                {/*header*/}
                                <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 dark:border-gray-700 rounded-t">
                                    <h3 className="text-3xl font-semibold">
                                        {props.title}
                                    </h3>
                                    <button
                                        className="p-1 ml-auto bg-transparent border-0 text-black dark:text-white opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                        onClick={() => setOpen(false)}
                                    >
                                        <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                                            ×
                                        </span>
                                    </button>
                                </div>
                                {/*body*/}
                                <div className="relative p-6 flex-auto">
                                    {props.children}
                                </div>
                                {/*footer*/}
                                <div className="flex items-center justify-end p-6 border-t border-solid border-gray-300 dark:border-gray-700 rounded-b">
                                    {props.buttons || (
                                        <button
                                            className="btn"
                                            type="button"
                                            style={{ transition: "all .15s ease" }}
                                            onClick={() => setOpen(false)}
                                        >
                                            OK
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
                </>
            ) : null}
        </>
    );
}