#!/usr/bin/env node

var nopt = require('nopt'),
    path = require('path'),
    fs   = require('fs'),
    eustia = require('../index'),
    _      = require('../lib/util');

_.log.enable();

var knowOpts = {
        encoding : String,
        output   : String,
        namespace: String,
        ignore   : Array,
        input    : String,
        library  : Array,
        exclude  : Array,
        include  : Array,
        command  : String,
        pattern  : String,
        raw      : Boolean,
        title    : String,
        watch    : Boolean
    },
    shortHands = {
        c: '--command',
        o: '--output',
        i: '--include',
        l: '--library',
        e: '--exclude',
        n: '--namespace',
        p: '--pattern',
        r: '--raw',
        t: '--title',
        w: '--watch'
    },
    options = nopt(knowOpts, shortHands, process.argv, 2),
    remain  = options.argv.remain,
    cmd, i, len;

for (i = 0, len = remain.length; i < len; i++)
{
    if (_.has(eustia, remain[i]))
    {
        cmd = remain[i];
        remain.splice(i, 1);
        break;
    }
}

options.files = options.argv.remain;

if (!cmd)
{
    var cfgPath = path.resolve(process.cwd(), '.eustia');

    fs.exists(cfgPath, function (exists)
    {
        if (exists)
        {
            _.log.ok('Using configuration file: ' + cfgPath);

            fs.readFile(cfgPath, 'utf-8', function (err, data)
            {
                var options;

                try {
                    options = JSON.parse(data);
                } catch (e)
                {
                    options = require(cfgPath);
                }

                buildAll(options);
            });
        } else eustia['help'](options);
    });
} else eustia[cmd](options);

function buildAll(configs)
{
    var cfgArr = [];

    _.each(configs, function (val, key)
    {
        val.taskName = key;
        cfgArr.push(val);
    });

    var cfgLen = cfgArr.length, i = 0;

    function build(config)
    {
        _.log('Run task "' + config.taskName + '":');

        eustia['build'](config, function () { if (++i < cfgLen) build(cfgArr[i]) });
    }
    build(cfgArr[i]);
}