import ItemIntent from './../../logic/ItemIntent';

export default ({
    buildable,
    name = 'build',
    primary = true,
    requires = 1,
    keyBind = 'b',
}) => new ItemIntent({
    keyBind, primary, name,
    description: `build ${buildable.name} (uses ${requires}) [lmb] [${keyBind}]`,
    options:     {requires, buildable},
});