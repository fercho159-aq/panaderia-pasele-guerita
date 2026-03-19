export const isValidHoustonZip = (zip: string) => {
    const houstonZips = [
        '77001', '77002', '77003', '77004', '77005', '77006', '77007', '77008', '77009', '77010',
        '77019', '77024', '77027', '77056', '77057', '77098', '77401'
    ];
    return houstonZips.includes(zip);
};

export const getEarliestAvailableDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 2); // 48h lead time
    return date;
};
