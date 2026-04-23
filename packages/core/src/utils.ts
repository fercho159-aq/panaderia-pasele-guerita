export const isValidHoustonZip = (zip: string) => {
    const houstonZips = [
        '77001', '77002', '77003', '77004', '77005', '77006', '77007', '77008', '77009', '77010',
        '77019', '77024', '77027', '77056', '77057', '77098', '77401'
    ];
    return houstonZips.includes(zip);
};

export const getEarliestAvailableDate = () => {
    return new Date();
};

export const isWednesdayOrSaturday = (dateStr: string) => {
    if (!dateStr) return false;
    // Parse the YYYY-MM-DD string as a local date to avoid timezone shifts
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay(); // 0: Sunday, 3: Wednesday, 6: Saturday
    return dayOfWeek === 3 || dayOfWeek === 6;
};
