// google drive
// functional request
// - user should CRUD folder
// - user should CRUD file
// - Sharing permission

interface FileManager {
    del();
    read(level: number);
    cd(path: string[]);
    getName(): string
}

class Folder implements FileManager {

    private name: string;
    private fileManager: FileManager[];

    constructor(name: string) {
        this.name = name;
        this.fileManager = [];
    }


    add(file: FileManager) {

        const f = this.fileManager.find(f => file.getName() === f.getName());

        if(f) {
            throw new Error("Conflict : File/Folder with same name found");
        }

        this.fileManager.push(file);
    }

    cd(path: string[]) {

        if(path.length == 0){
            return this;
        }

        const file = this.fileManager.find(f => f.getName() == path[0])
        if(!file) {
            throw new Error("File not found {404}");
        }

        return file.cd(path.slice(1));
    }

    getName(): string {
        return this.name;
    }

    read(level: number) {
        
        for(const file of this.fileManager) {
            console.log(`${" ".repeat(level * 2)}📁 Folder: ${this.name}`);
            file.read(level+1)
        }
    }

    del() {
         console.log("Folder: ", this.name, "deleted")
    }
}

class File implements FileManager {

    private name: string;
    private content: string;

    constructor(name: string, content: string) {
        this.name = name;
        this.content = content;
    }

    add(file: FileManager) {
        throw Error("Cannot add file/folder in file")
    }

    cd(path: string[]) {

    }

    getName() {
        return this.name
    }

    read(level: number) {
        console.log(`${" ".repeat(level * 2)}📁 File: ${this.name}`);
        console.log(this.name)
    }

    del() {
        console.log("File: ", this.name, "deleted")
    }
}


class FileController {

    private fileMap: Map<string, FileManager>;

    constructor() {
        this.fileMap = new Map();
    }

    resolvePath(filePath: string) {
        const fp = filePath.split('/');
        
        const file = this.fileMap.get(fp[0]);
        if(!file) {
            throw new Error("File not found {404}");
        }

        return file.cd(fp.slice(1));

    }

    add(path: string, file: FileManager) {
        const fl = this.resolvePath(path);
        fl.add(file)
    }

    get(user_id) {
        // check access here 
    }

    // addFolder() {}
}

enum Permission {
    VIEW = 3,
    EDIT = 2,
    OWNER = 1
}

class PermissionManager {

    private permissions: Map<number, Map<string,Permission[]>>

    PermissionManager() {
        this.permissions = new Map();
    }

    hasAccess(user_id: number, file_path: string, access_level: Permission) {

        const user = this.permissions.get(user_id);

        if(!user){
            throw new Error("UnAuthorized Error");
        }

        const fp = file_path.split(',');

        let path = ''

        for(const p of fp) {
            path += '/' + p;
            const access = user.get(path) || []
            
            

            if(access.filter(ac => ac >= access_level)){
                return true;
            }

        }

        throw new Error("UnAuthorized Error");

    }
    
    check(user_id: number, file_id: string, access_level: Permission): boolean {

        try {
            const access = this.hasAccess(user_id, file_id, access_level);
            return access;
        }catch (error: Error) {
            if(error.message == "UnAuthorized Error"){
                return false;
            }
        }

        return false;
    }
}

