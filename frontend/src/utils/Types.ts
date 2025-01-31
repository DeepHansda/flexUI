import React, { FormEvent, ReactNode } from "react";

export type AppFormType = {
    children: ReactNode;
    onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
    className?: string;
}

export type AppModalType = {
    children: React.ReactNode;
    headerTitle?: string;
    isOpen: boolean;
    onClose?: () => void;
    backdrop?: "transparent" | "opaque" | "blur" | undefined;
    size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full";
    ModalFooterComponent?: React.ReactNode;
}

export type AuthModalType = {
    isOpen: boolean
    onClose: () => void
}