const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

// ======================================================
// KRIJO DRITAREN KRYESORE
// ======================================================

function createWindow() {
    const win = new BrowserWindow({
        width: 1600,
        height: 900,
        minWidth: 1200,
        minHeight: 700,

        autoHideMenuBar: true,

        icon: path.join(
            __dirname,
            "assets",
            "Cuffi-Logo.ico"
        ),

        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    win.loadFile("hub.html");
}


// ======================================================
// FOLDERI KU DO TE RUHEN FOTOT E INVENTARIT
// ======================================================

function getInventoryImagesFolder() {

    const folder = path.join(
        app.getPath("userData"),
        "inventory-images"
    );

    // Nëse folderi nuk ekziston, krijoje
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, {
            recursive: true
        });
    }

    return folder;
}


// ======================================================
// RUAJ NJE FOTO TE RE NE DISK
// ======================================================

ipcMain.handle(
    "save-inventory-image",
    async (event, data) => {

        try {

            const folder =
                getInventoryImagesFolder();

            if (!data || !data.dataUrl) {
                throw new Error(
                    "Nuk u mor fotografia."
                );
            }

            // Lexojmë fotografinë Base64
            const matches =
                data.dataUrl.match(
                    /^data:image\/([a-zA-Z0-9.+-]+);base64,(.+)$/
                );

            if (!matches) {
                throw new Error(
                    "Formati i fotos nuk është i vlefshëm."
                );
            }

            let extension =
                matches[1].toLowerCase();

            if (extension === "jpeg") {
                extension = "jpg";
            }

            const buffer =
                Buffer.from(
                    matches[2],
                    "base64"
                );

            // Emër unik për fotografinë
            const fileName =
                "inventory-" +
                Date.now() +
                "-" +
                Math.random()
                    .toString(36)
                    .slice(2, 8) +
                "." +
                extension;

            const filePath =
                path.join(
                    folder,
                    fileName
                );

            // Ruaj fotografinë
            fs.writeFileSync(
                filePath,
                buffer
            );

            return {
                success: true,
                path: filePath
            };

        } catch (error) {

            console.error(
                "Gabim gjatë ruajtjes së fotos:",
                error
            );

            return {
                success: false,
                error: error.message
            };
        }
    }
);


// ======================================================
// MIGRO FOTOT E VJETRA BASE64 NE FOLDER
// ======================================================

ipcMain.handle(
    "migrate-inventory-images",
    async (event, items) => {

        try {

            const folder =
                getInventoryImagesFolder();

            if (!Array.isArray(items)) {
                throw new Error(
                    "Inventari nuk është i vlefshëm."
                );
            }

            let converted = 0;
            let skipped = 0;

            for (const item of items) {

                // Nuk ka fotografi
                if (!item.img) {
                    skipped++;
                    continue;
                }

                // Nëse nuk është Base64,
                // fotografia është migruar tashmë
                if (
                    !item.img.startsWith(
                        "data:image"
                    )
                ) {
                    skipped++;
                    continue;
                }

                const matches =
                    item.img.match(
                        /^data:image\/([a-zA-Z0-9.+-]+);base64,(.+)$/
                    );

                if (!matches) {
                    skipped++;
                    continue;
                }

                let extension =
                    matches[1].toLowerCase();

                if (extension === "jpeg") {
                    extension = "jpg";
                }

                const buffer =
                    Buffer.from(
                        matches[2],
                        "base64"
                    );

                const fileName =
                    "inventory-" +
                    item.id +
                    "-" +
                    Date.now() +
                    "-" +
                    Math.random()
                        .toString(36)
                        .slice(2, 6) +
                    "." +
                    extension;

                const filePath =
                    path.join(
                        folder,
                        fileName
                    );

                // Ruaj fotografinë në disk
                fs.writeFileSync(
                    filePath,
                    buffer
                );

                // Base64 hiqet nga produkti
                // dhe zëvendësohet me adresën e fotos
                item.img = filePath;

                converted++;
            }

            return {
                success: true,
                items: items,
                converted: converted,
                skipped: skipped,
                folder: folder
            };

        } catch (error) {

            console.error(
                "Gabim gjatë migrimit:",
                error
            );

            return {
                success: false,
                error: error.message
            };
        }
    }
);


// ======================================================
// NISE APLIKACIONIN
// ======================================================

app.whenReady().then(() => {

    createWindow();

    app.on(
        "activate",
        function () {

            if (
                BrowserWindow
                    .getAllWindows()
                    .length === 0
            ) {
                createWindow();
            }

        }
    );

});


// ======================================================
// MBYLL APLIKACIONIN
// ======================================================

app.on(
    "window-all-closed",
    () => {

        if (
            process.platform !== "darwin"
        ) {
            app.quit();
        }

    }
);