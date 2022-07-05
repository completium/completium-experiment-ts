"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entrypoint = exports.string_cmp = exports.set_to_mich = exports.list_to_mich = exports.option_to_mich = exports.some_to_mich = exports.option_to_mich_type = exports.pair_to_mich_type = exports.pair_to_mich = exports.elt_to_mich = exports.bigint_to_mich = exports.bool_to_mich = exports.string_to_mich = exports.none_mich = exports.prim_to_mich_type = exports.transfer = exports.call = exports.deploy = exports.get_storage = exports.sign = exports.get_big_map_value = exports.expect_to_fail = exports.pack = exports.get_account = exports.set_mockup_now = exports.set_quiet = exports.set_mockup = void 0;
var Completium = require('@completium/completium-cli');
/* Experiment API ---------------------------------------------------------- */
var set_mockup = function () {
    Completium.setEndpoint('mockup');
};
exports.set_mockup = set_mockup;
var set_quiet = function (b) {
    Completium.setQuiet(b);
};
exports.set_quiet = set_quiet;
var set_mockup_now = function (d) {
    Completium.setMockupNow(Math.floor(d.getTime() / 1000));
};
exports.set_mockup_now = set_mockup_now;
var get_account = function (name) {
    var a = Completium.getAccount(name);
    return {
        name: a.name,
        pubk: a.pubk,
        pkh: a.pkh,
        sk: a.sk
    };
};
exports.get_account = get_account;
var pack = function (obj, typ) {
    if (typ != undefined) {
        return Completium.packTyped(obj, typ);
    }
    else {
        return Completium.pack(obj);
    }
};
exports.pack = pack;
/**
 * Expects f to fail with error
 * @param f async call to execute
 * @param error error that f is expected to thow
 */
var expect_to_fail = function (f, error) { return __awaiter(void 0, void 0, void 0, function () {
    var err;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                err = error["string"] /* TODO: manage other error type */;
                return [4 /*yield*/, Completium.expectToThrow(f, err)];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
exports.expect_to_fail = expect_to_fail;
/**
 * Returns value associated to key in big map
 * @param big_map_id big map identifier
 * @param key_value value of key
 * @param key_type type of key
 * @returns Micheline value associated to key
 */
var get_big_map_value = function (big_map_id, key_value, key_type) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Completium.getValueFromBigMap(big_map_id.toString(), key_value, key_type)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.get_big_map_value = get_big_map_value;
var sign = function (v, a) { return __awaiter(void 0, void 0, void 0, function () {
    var signed;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Completium.sign(v, { as: a.name })];
            case 1:
                signed = _a.sent();
                return [2 /*return*/, signed.prefixSig];
        }
    });
}); };
exports.sign = sign;
/**
 * Returns contract storage
 * @param c contract address
 * @returns storage record
 */
var get_storage = function (c) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Completium.getStorage(c)];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.get_storage = get_storage;
/**
 * Deploys contract
 * @param path (relative/absolute) path to archetype file (.arl)
 * @param params contract parameters
 * @param p deployment parameters (as, amout)
 * @returns address of deployed contract
 */
var deploy = function (path, params, p) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, contract, _;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, Completium.deploy(path, {
                    parameters: params,
                    as: params.as,
                    amount: params.amount ? params.amount.toString() + "utz" : undefined
                })];
            case 1:
                _a = _b.sent(), contract = _a[0], _ = _a[1];
                return [2 /*return*/, contract.address];
        }
    });
}); };
exports.deploy = deploy;
/**
 * Calls a contract entrypoint
 * @param c contract address
 * @param e entry point name
 * @param a entry point argument
 * @param p parameters (as, amount)
 */
var call = function (c, e, a, p) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, Completium.call(c, {
                    entry: e,
                    argJsonMichelson: a,
                    as: p.as ? p.as.pkh : undefined,
                    amount: p.amount ? p.amount.toString() + "utz" : undefined
                })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.call = call;
/**
 * Transfers tez
 * @param from account to transfer from
 * @param to   account or address to transfer to
 * @param amount amount to transfer in mutez
 * @returns
 */
var transfer = function (from, to, amount) { return __awaiter(void 0, void 0, void 0, function () {
    var to_;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                to_ = typeof to == "string" ? to : to.pkh;
                return [4 /*yield*/, Completium.transfer(from.pkh, to_, amount.toString())];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
exports.transfer = transfer;
/* to Micheline ------------------------------------------------------------ */
var prim_to_mich_type = function (p) {
    return {
        prim: p
    };
};
exports.prim_to_mich_type = prim_to_mich_type;
exports.none_mich = {
    "prim": "None"
};
var string_to_mich = function (v) {
    return { "string": v };
};
exports.string_to_mich = string_to_mich;
var bool_to_mich = function (v) {
    return { "string": v ? "True" : "False" };
};
exports.bool_to_mich = bool_to_mich;
var bigint_to_mich = function (v) {
    return { "int": v.toString() };
};
exports.bigint_to_mich = bigint_to_mich;
var elt_to_mich = function (a, b) {
    return {
        prim: "Elt",
        args: [a, b]
    };
};
exports.elt_to_mich = elt_to_mich;
var pair_to_mich = function (a, b) {
    return {
        prim: "Pair",
        args: [a, b]
    };
};
exports.pair_to_mich = pair_to_mich;
var pair_to_mich_type = function (a, b) {
    return {
        prim: "pair",
        args: [a, b]
    };
};
exports.pair_to_mich_type = pair_to_mich_type;
var option_to_mich_type = function (a) {
    return {
        prim: "option",
        args: [a]
    };
};
exports.option_to_mich_type = option_to_mich_type;
var some_to_mich = function (a) {
    return {
        prim: "Some",
        args: [a]
    };
};
exports.some_to_mich = some_to_mich;
var option_to_mich = function (v, to_mich) {
    if (v != undefined) {
        return (0, exports.some_to_mich)(to_mich(v));
    }
    else {
        return exports.none_mich;
    }
};
exports.option_to_mich = option_to_mich;
var list_to_mich = function (l, to_mich) {
    return l.map(function (x) { return to_mich(x); });
};
exports.list_to_mich = list_to_mich;
var set_to_mich = function (s, to_json) {
    Array.from(s.values()).map(function (x) { return to_json(x); });
};
exports.set_to_mich = set_to_mich;
var string_cmp = function (a, b) {
    if (a === b) {
        return 0;
    }
    return a < b ? -1 : 1;
};
exports.string_cmp = string_cmp;
var Entrypoint = /** @class */ (function () {
    function Entrypoint(a, n) {
        this.addr = a;
        this.name = n;
    }
    Entrypoint.prototype.to_mich = function () {
        return (0, exports.string_to_mich)(this.addr + "%" + this.name);
    };
    return Entrypoint;
}());
exports.Entrypoint = Entrypoint;
//# sourceMappingURL=main.js.map