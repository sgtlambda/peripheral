class ItemIntent {
    constructor({
        keyBind,
        name,
        description,
        options,
    }) {
        this.keyBind     = keyBind;
        this.name        = name;
        this.description = description;
        this.options     = options;
    }
}

export default ItemIntent;