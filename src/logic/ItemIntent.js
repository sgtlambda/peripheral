class ItemIntent {
    constructor({
        keyBind,
        primary = false,
        trigger = null,
        name,
        description,
        options,
    }) {
        this.keyBind     = keyBind;
        this.primary     = primary;
        this.name        = name;
        this.description = description;
        this.options     = options;
        this.trigger     = trigger;
    }
}

export default ItemIntent;