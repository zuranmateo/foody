'use server'

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { writeClient } from "@/sanity/lib/write-client";

export async function UpdateUserProfile(formData: FormData) {
    const session = await auth();
    const userId = String(formData.get("userId") ?? "");
    const name = String(formData.get("name") ?? "").trim();
    const surname = String(formData.get("surname") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const address = String(formData.get("address") ?? "").trim();
    const file = formData.get("image");

    if (!session?.user?._id) {
        redirect("/login");
    }

    if (!userId || session.user._id !== userId) {
        redirect("/");
    }

    if (!name || !email) {
        throw new Error("Name and email are required.");
    }

    const patch = writeClient
        .patch(userId)
        .set({
            name,
            surname: surname || undefined,
            email,
            phone: phone || undefined,
            address: address || undefined,
        });

    if (file instanceof File && file.size > 0) {
        const asset = await writeClient.assets.upload("image", file, {
            filename: file.name,
        });

        patch.set({
            image: {
                _type: "image",
                asset: {
                    _type: "reference",
                    _ref: asset._id,
                },
            },
        });
    }

    await patch.commit();

    redirect(`/user/${userId}`);
}
