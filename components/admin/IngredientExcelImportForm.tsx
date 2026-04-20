"use client";

import { ImportIngredientsFromExcel, type ImportIngredientsState } from "@/lib/admin-actions";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

const initialState: ImportIngredientsState = {
    status: "idle",
    message: "",
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
            {pending ? "Importing..." : "Import with Excel"}
        </button>
    );
}

export default function IngredientExcelImportForm() {
    const [state, formAction] = useActionState(ImportIngredientsFromExcel, initialState);

    return (
        <section className="rounded-3xl border p-5">
            <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold">Import with Excel</h3>
                <p className="text-sm text-muted-foreground">
                    Upload an Excel file to create new ingredients or add quantities to existing ones automatically.
                </p>
            </div>

            <div className="mt-4 rounded-2xl border bg-muted/20 p-4 text-sm">
                <p className="font-medium">How to prepare the Excel file</p>
                <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
                    <li>Use the first row as headers.</li>
                    <li>Required columns: <code>name</code>, <code>quantity</code>, <code>unit</code>.</li>
                    <li>Optional column: <code>inStock</code>.</li>
                    <li>Allowed units: <code>kosov</code>, <code>mg</code>, <code>g</code>, <code>kg</code>, <code>ml</code>, <code>l</code>.</li>
                    <li>If the same ingredient appears multiple times, the imported quantities are added together.</li>
                    <li>If an ingredient already exists in the database, its quantity is increased instead of creating a duplicate.</li>
                </ul>
            </div>

            <div className="mt-4 overflow-x-auto rounded-2xl border">
                <table className="min-w-full text-sm">
                    <thead className="bg-muted/30 text-left">
                        <tr>
                            <th className="px-4 py-3 font-medium">name</th>
                            <th className="px-4 py-3 font-medium">quantity</th>
                            <th className="px-4 py-3 font-medium">unit</th>
                            <th className="px-4 py-3 font-medium">inStock</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className="border-t">
                            <td className="px-4 py-3">Tomato</td>
                            <td className="px-4 py-3">12.5</td>
                            <td className="px-4 py-3">kg</td>
                            <td className="px-4 py-3">true</td>
                        </tr>
                        <tr className="border-t">
                            <td className="px-4 py-3">Olive Oil</td>
                            <td className="px-4 py-3">4</td>
                            <td className="px-4 py-3">l</td>
                            <td className="px-4 py-3">true</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <form action={formAction} className="mt-5 space-y-4" encType="multipart/form-data">
                <label className="block space-y-2 text-sm">
                    <span className="text-muted-foreground">Excel file</span>
                    <input
                        type="file"
                        name="excelFile"
                        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                        className="block w-full rounded-2xl border bg-background px-3 py-2"
                        required
                    />
                </label>

                <label className="flex items-start gap-3 rounded-2xl border bg-muted/10 p-4 text-sm">
                    <input type="checkbox" name="confirmImport" className="mt-1" />
                    <span>
                        I confirm that this file is correct and that importing it should update the ingredient stock in the database.
                    </span>
                </label>

                <div className="flex flex-wrap items-center gap-3">
                    <SubmitButton />
                    {state.status !== "idle" ? (
                        <p
                            className={`text-sm ${
                                state.status === "success" ? "text-green-700" : "text-red-700"
                            }`}
                        >
                            {state.message}
                            {state.summary
                                ? ` Rows: ${state.summary.rowsProcessed}, created: ${state.summary.created}, updated: ${state.summary.updated}.`
                                : ""}
                        </p>
                    ) : null}
                </div>
            </form>
        </section>
    );
}
