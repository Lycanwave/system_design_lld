// Design: KV store
// functional req:-
// 1. user should perform crud operations.
// 2. user can put any type of data in that, either Object/string/int
// 3. it should also give the support of TTL.

// Non functional Req :- 
// 1. the code should be extendible, scalable enough and redalble


// Flow
// query -> Command -> KVStore{map}

abstract class Value {

    
    expiry: Date | undefined
    public readonly data_type: ValueType

    constructor(data_type: ValueType) {
        this.data_type = data_type
    }

    expired(): boolean  {

        if(!this.expiry){
            return false;
        }

        const currentTime = new Date().getTime();
        if(this.expiry.getTime() <= currentTime){
            return true;
        }

        return false;

    }  
}

enum ValueType {
    Number,
    STRING,
    BLOOM
}

class StringValue extends Value {
    value: string
    
    

    constructor(value: any, expiry?: Date) {
        super(ValueType.STRING)
        this.value = value
        this.expiry = expiry || new Date()
    }

    getValue() {
        return this.value;
    }

    
}

class BloomFilter extends Value {
    private value: Array<number>;
    

    constructor(capacity: number) {
        super(ValueType.BLOOM)
        this.value = new Array(capacity)
    }

    getValue() {
        return this.value;
    }

    

    add(key: string): number {
        // lock
        // bloom filter logic
        // unlock

        return 1;
    }
}


class KeyValueEngine{

    private map: Map<string,Value>;
    private static instance: KeyValueEngine | null = null;

    private constructor() {
        this.map = new Map();
    }

    static getInstance(): KeyValueEngine {
        
        if(!this.instance) {
            this.instance = new KeyValueStore();
        }

        return this.instance
    }

    get(key: string): Value | undefined {

        const value = this.map.get(key);

        if(!value || value.expired()) return undefined;

        return value;

    }

    put(key: string, value: Value): number {

        this.map.set(key, value);

        return 1;

    }

    putIfNotExist(key: string, value: Value): number {

        const keyExist = this.get(key);

        if(keyExist){
            return 0;
        }

        return this.put(key, value);
    }

    delete(key: string): number {

        const deleted = this.map.delete(key);

        return +deleted
    }

}

interface TResult {
    value?: any,
    error?: Error
}

interface Command {
    execute(...args: any[]): TResult;
}


class Get implements Command {

    constructor() {}

    execute(key: string): TResult {

        const instance = KeyValueEngine.getInstance();
        const value = instance.get(key)

        return {value: value}
        
    }
}

class Put implements Command {

    constructor() {}

    execute(key: string, value: Value): TResult {

        const instance = KeyValueEngine.getInstance();
        const val = instance.put(key, value)

        return {value: val}
        
    }
}

class PutIfNotExist implements Command {

    constructor() {}

    execute(key: string, value: Value): TResult {

        const instance = KeyValueEngine.getInstance();
        const val = instance.putIfNotExist(key, value)

        return {value: val}
        
    }
}

class BFADD implements Command {

    constructor() {}

    execute(key: string): TResult {

        const instance = KeyValueEngine.getInstance();
        const val = instance.get(key);

        if(!val)
        return {value: null};
        
        if (!(val instanceof BloomFilter)) {
            return {error: new Error(`WRONGTYPE: ${key} is not a Bloom filter`)};
        }
        const resp = val.add(key)
        return {value: resp}
        
    }
}

 
