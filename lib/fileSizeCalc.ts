/**
 * Utility function to convert file size in bytes to a human-readable format.
 * @param File The file object for which to calculate size.
 * @returns A string representing the file size in an appropriate unit (Bytes, KB, MB, GB, TB)
 * with two decimal places.
 */
export const getFileSize = (File: File | null): string => {
    if (!File) return "0 Bytes";
    const units = ["Bytes", "KB", "MB", "GB", "TB"];
    let size = File.size, unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
};