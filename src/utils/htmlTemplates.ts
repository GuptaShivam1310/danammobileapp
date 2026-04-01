export const getSharePostHtml = (
    title: string,
    category: string,
    date: string,
    images: string[],
    description: string,
    address?: string,
) => {
    return `
        <html>
            <body style="font-family: 'Helvetica', sans-serif; padding: 40px; color: #1F2937;">
                <h1 style="font-size: 28px; font-weight: bold; margin-bottom: 8px; color: #111827;">${title}</h1>
                <p style="font-size: 14px; color: #6B7280; margin-bottom: 24px;">${category} | ${date}</p>
                
                <div style="margin-bottom: 24px;">
                    ${images
            .map(
                img =>
                    `<img src="${img}" style="width: 100%; border-radius: 12px; margin-bottom: 16px;"/>`,
            )
            .join('')}
                </div>
                
                <div style="margin-bottom: 24px;">
                    <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">Description</h2>
                    <p style="font-size: 16px; line-height: 1.6; color: #374151;">${description}</p>
                </div>
                
                ${address
            ? `
                <div style="margin-bottom: 24px;">
                    <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">Location</h2>
                    <p style="font-size: 16px; color: #374151;">${address}</p>
                </div>
                `
            : ''
        }
                
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #E5E7EB; text-align: center;">
                    <p style="font-size: 12px; color: #9CA3AF;">Shared via Danam App</p>
                </div>
            </body>
        </html>
    `;
};
