class ItemIntent {
    constructor({
        keyBind,
        primary = false,
        continuous = false,
        trigger = null,
        type,
        description,
        options,
    }) {
        this.keyBind     = keyBind;
        this.primary     = primary;
        this.continuous  = continuous;
        this.type        = type;
        this.description = description;
        this.options     = options;
        this.trigger     = trigger;
    }
}

export default ItemIntent;