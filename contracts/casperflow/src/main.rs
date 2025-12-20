#![no_std]
#![no_main]

extern crate alloc;

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}

use alloc::{format, string::String, vec};
use casper_contract::{
    contract_api::{runtime, storage},
    unwrap_or_revert::UnwrapOrRevert,
};
use casper_types::{
    contracts::{EntryPoint, NamedKeys},
    ApiError, CLType, CLValue, EntryPointAccess, EntryPointType, EntryPoints, Key, Parameter,
    URef, U256, U512,
};

// Constants
const KEY_NAME: &str = "name";
const KEY_SYMBOL: &str = "symbol";
const KEY_DECIMALS: &str = "decimals";
const KEY_TOTAL_SUPPLY: &str = "total_supply";
const KEY_ADMIN: &str = "admin";
const KEY_PAUSED: &str = "paused";
const KEY_TOTAL_STAKED: &str = "total_staked";
const KEY_MAX_LEVERAGE: &str = "max_leverage";
const KEY_VAULT_TOTAL: &str = "vault_total";
const KEY_LIQUID_STAKING_RATIO: &str = "liquid_staking_ratio";
const KEY_TOTAL_LIQUID_STAKED: &str = "total_liquid_staked";
const KEY_ORDER_COUNTER: &str = "order_counter";

const DICT_BALANCES: &str = "balances";
const DICT_ALLOWANCES: &str = "allowances";
const DICT_STAKERS: &str = "stakers";
const DICT_POSITIONS: &str = "positions";
const DICT_VAULT: &str = "vault_shares";
const DICT_LIQUID_STAKERS: &str = "liquid_stakers";
const DICT_STCSPR_BALANCES: &str = "stcspr_balances";
const DICT_ORDERS: &str = "orders";

const ARG_CONTRACT_NAME: &str = "contract_name";
const ARG_TOKEN_NAME: &str = "token_name";
const ARG_TOKEN_SYMBOL: &str = "token_symbol";
const ARG_TOTAL_SUPPLY: &str = "total_supply";
const ARG_RECIPIENT: &str = "recipient";
const ARG_OWNER: &str = "owner";
const ARG_SPENDER: &str = "spender";
const ARG_AMOUNT: &str = "amount";
const ARG_ORDER_ID: &str = "order_id";
const ARG_ORDER_TYPE: &str = "order_type";
const ARG_PRICE: &str = "price";
const ARG_TRIGGER_PRICE: &str = "trigger_price";

#[repr(u16)]
enum Error {
    InsufficientBalance = 1,
    InsufficientAllowance = 2,
    Unauthorized = 3,
    ContractPaused = 4,
    InvalidAmount = 5,
}

impl From<Error> for ApiError {
    fn from(error: Error) -> Self {
        ApiError::User(error as u16)
    }
}

fn get_key<T: casper_types::bytesrepr::FromBytes + casper_types::CLTyped>(name: &str) -> T {
    let key = runtime::get_key(name).unwrap_or_revert_with(ApiError::User(100));
    let uref = key.into_uref().unwrap_or_revert_with(ApiError::User(101));
    storage::read(uref)
        .unwrap_or_revert_with(ApiError::User(102))
        .unwrap_or_revert_with(ApiError::User(103))
}

fn set_key<T: casper_types::bytesrepr::ToBytes + casper_types::CLTyped>(name: &str, value: T) {
    let key = runtime::get_key(name).unwrap_or_revert_with(ApiError::User(100));
    let uref = key.into_uref().unwrap_or_revert_with(ApiError::User(101));
    storage::write(uref, value);
}

fn get_dict(name: &str) -> URef {
    let key = runtime::get_key(name).unwrap_or_revert_with(ApiError::User(104));
    key.into_uref().unwrap_or_revert_with(ApiError::User(105))
}

fn make_key(key: &Key) -> String {
    format!("{:?}", key)
}

// Token functions
#[no_mangle]
pub extern "C" fn name() {
    let val: String = get_key(KEY_NAME);
    runtime::ret(CLValue::from_t(val).unwrap_or_revert());
}

#[no_mangle]
pub extern "C" fn symbol() {
    let val: String = get_key(KEY_SYMBOL);
    runtime::ret(CLValue::from_t(val).unwrap_or_revert());
}

#[no_mangle]
pub extern "C" fn decimals() {
    let val: u8 = get_key(KEY_DECIMALS);
    runtime::ret(CLValue::from_t(val).unwrap_or_revert());
}

#[no_mangle]
pub extern "C" fn total_supply() {
    let val: U256 = get_key(KEY_TOTAL_SUPPLY);
    runtime::ret(CLValue::from_t(val).unwrap_or_revert());
}

#[no_mangle]
pub extern "C" fn balance_of() {
    let owner: Key = runtime::get_named_arg(ARG_OWNER);
    let dict = get_dict(DICT_BALANCES);
    let balance: U256 = storage::dictionary_get(dict, &make_key(&owner))
        .unwrap_or_revert()
        .unwrap_or(U256::zero());
    runtime::ret(CLValue::from_t(balance).unwrap_or_revert());
}

#[no_mangle]
pub extern "C" fn transfer() {
    let recipient: Key = runtime::get_named_arg(ARG_RECIPIENT);
    let amount: U256 = runtime::get_named_arg(ARG_AMOUNT);
    let caller = Key::from(runtime::get_caller());
    
    let dict = get_dict(DICT_BALANCES);
    let from_bal: U256 = storage::dictionary_get(dict, &make_key(&caller))
        .unwrap_or_revert()
        .unwrap_or(U256::zero());
    
    if from_bal < amount {
        runtime::revert(Error::InsufficientBalance);
    }
    
    let to_bal: U256 = storage::dictionary_get(dict, &make_key(&recipient))
        .unwrap_or_revert()
        .unwrap_or(U256::zero());
    
    storage::dictionary_put(dict, &make_key(&caller), from_bal - amount);
    storage::dictionary_put(dict, &make_key(&recipient), to_bal + amount);
}

#[no_mangle]
pub extern "C" fn approve() {
    let spender: Key = runtime::get_named_arg(ARG_SPENDER);
    let amount: U256 = runtime::get_named_arg(ARG_AMOUNT);
    let caller = Key::from(runtime::get_caller());
    
    let dict = get_dict(DICT_ALLOWANCES);
    let key = format!("{}_{}", make_key(&caller), make_key(&spender));
    storage::dictionary_put(dict, &key, amount);
}

#[no_mangle]
pub extern "C" fn allowance() {
    let owner: Key = runtime::get_named_arg(ARG_OWNER);
    let spender: Key = runtime::get_named_arg(ARG_SPENDER);
    
    let dict = get_dict(DICT_ALLOWANCES);
    let key = format!("{}_{}", make_key(&owner), make_key(&spender));
    let val: U256 = storage::dictionary_get(dict, &key)
        .unwrap_or_revert()
        .unwrap_or(U256::zero());
    runtime::ret(CLValue::from_t(val).unwrap_or_revert());
}

// Staking functions
#[no_mangle]
pub extern "C" fn stake() {
    let amount: U512 = runtime::get_named_arg(ARG_AMOUNT);
    let caller = Key::from(runtime::get_caller());
    
    let dict = get_dict(DICT_STAKERS);
    let current: U512 = storage::dictionary_get(dict, &make_key(&caller))
        .unwrap_or_revert()
        .unwrap_or(U512::zero());
    
    let new_stake = current + amount;
    storage::dictionary_put(dict, &make_key(&caller), new_stake);
    
    let total: U512 = get_key(KEY_TOTAL_STAKED);
    set_key(KEY_TOTAL_STAKED, total + amount);
}

#[no_mangle]
pub extern "C" fn unstake() {
    let amount: U512 = runtime::get_named_arg(ARG_AMOUNT);
    let caller = Key::from(runtime::get_caller());
    
    let dict = get_dict(DICT_STAKERS);
    let current: U512 = storage::dictionary_get(dict, &make_key(&caller))
        .unwrap_or_revert()
        .unwrap_or(U512::zero());
    
    if current < amount {
        runtime::revert(Error::InsufficientBalance);
    }
    
    storage::dictionary_put(dict, &make_key(&caller), current - amount);
    
    let total: U512 = get_key(KEY_TOTAL_STAKED);
    set_key(KEY_TOTAL_STAKED, total - amount);
}

#[no_mangle]
pub extern "C" fn get_stake() {
    let owner: Key = runtime::get_named_arg(ARG_OWNER);
    let dict = get_dict(DICT_STAKERS);
    let stake: U512 = storage::dictionary_get(dict, &make_key(&owner))
        .unwrap_or_revert()
        .unwrap_or(U512::zero());
    runtime::ret(CLValue::from_t(stake).unwrap_or_revert());
}

// Trading functions
#[no_mangle]
pub extern "C" fn open_position() {
    let amount: U512 = runtime::get_named_arg(ARG_AMOUNT);
    let leverage: u32 = runtime::get_named_arg::<u32>("leverage");
    let caller = Key::from(runtime::get_caller());
    
    let dict = get_dict(DICT_POSITIONS);
    let position_id: u64 = runtime::get_blocktime().into();
    let key = format!("{}_{}", make_key(&caller), position_id);
    let size = amount * U512::from(leverage);
    storage::dictionary_put(dict, &key, size);
}

#[no_mangle]
pub extern "C" fn close_position() {
    let position_id: u64 = runtime::get_named_arg("position_id");
    let caller = Key::from(runtime::get_caller());
    
    let dict = get_dict(DICT_POSITIONS);
    let key = format!("{}_{}", make_key(&caller), position_id);
    storage::dictionary_put(dict, &key, U512::zero());
}

// Vault functions
#[no_mangle]
pub extern "C" fn vault_deposit() {
    let amount: U512 = runtime::get_named_arg(ARG_AMOUNT);
    let caller = Key::from(runtime::get_caller());
    
    let dict = get_dict(DICT_VAULT);
    let current: U512 = storage::dictionary_get(dict, &make_key(&caller))
        .unwrap_or_revert()
        .unwrap_or(U512::zero());
    
    storage::dictionary_put(dict, &make_key(&caller), current + amount);
    
    let total: U512 = get_key(KEY_VAULT_TOTAL);
    set_key(KEY_VAULT_TOTAL, total + amount);
}

#[no_mangle]
pub extern "C" fn vault_withdraw() {
    let amount: U512 = runtime::get_named_arg(ARG_AMOUNT);
    let caller = Key::from(runtime::get_caller());
    
    let dict = get_dict(DICT_VAULT);
    let current: U512 = storage::dictionary_get(dict, &make_key(&caller))
        .unwrap_or_revert()
        .unwrap_or(U512::zero());
    
    if current < amount {
        runtime::revert(Error::InsufficientBalance);
    }
    
    storage::dictionary_put(dict, &make_key(&caller), current - amount);
    
    let total: U512 = get_key(KEY_VAULT_TOTAL);
    set_key(KEY_VAULT_TOTAL, total - amount);
}
// Liquid Staking Derivatives functions
#[no_mangle]
pub extern "C" fn stake_for_liquid() {
    let amount: U512 = runtime::get_named_arg(ARG_AMOUNT);
    let caller = Key::from(runtime::get_caller());
    
    // Get current ratio (stCSPR per CSPR)
    let ratio: U512 = get_key(KEY_LIQUID_STAKING_RATIO);
    let stcspr_amount = if ratio == U512::zero() {
        amount
    } else {
        amount * U512::from(1000000u64) / ratio
    };
    
    // Update liquid staker balance
    let dict = get_dict(DICT_LIQUID_STAKERS);
    let current: U512 = storage::dictionary_get(dict, &make_key(&caller))
        .unwrap_or_revert()
        .unwrap_or(U512::zero());
    storage::dictionary_put(dict, &make_key(&caller), current + amount);
    
    // Mint stCSPR tokens
    let stcspr_dict = get_dict(DICT_STCSPR_BALANCES);
    let stcspr_balance: U512 = storage::dictionary_get(stcspr_dict, &make_key(&caller))
        .unwrap_or_revert()
        .unwrap_or(U512::zero());
    storage::dictionary_put(stcspr_dict, &make_key(&caller), stcspr_balance + stcspr_amount);
    
    // Update totals
    let total_liquid: U512 = get_key(KEY_TOTAL_LIQUID_STAKED);
    set_key(KEY_TOTAL_LIQUID_STAKED, total_liquid + amount);
    
    let total_staked: U512 = get_key(KEY_TOTAL_STAKED);
    set_key(KEY_TOTAL_STAKED, total_staked + amount);
}

#[no_mangle]
pub extern "C" fn unstake_liquid() {
    let stcspr_amount: U512 = runtime::get_named_arg(ARG_AMOUNT);
    let caller = Key::from(runtime::get_caller());
    
    // Get current ratio
    let ratio: U512 = get_key(KEY_LIQUID_STAKING_RATIO);
    let cspr_amount = if ratio == U512::zero() {
        stcspr_amount
    } else {
        stcspr_amount * ratio / U512::from(1000000u64)
    };
    
    // Burn stCSPR tokens
    let stcspr_dict = get_dict(DICT_STCSPR_BALANCES);
    let stcspr_balance: U512 = storage::dictionary_get(stcspr_dict, &make_key(&caller))
        .unwrap_or_revert()
        .unwrap_or(U512::zero());
    
    if stcspr_balance < stcspr_amount {
        runtime::revert(ApiError::from(Error::InsufficientBalance));
    }
    
    storage::dictionary_put(stcspr_dict, &make_key(&caller), stcspr_balance - stcspr_amount);
    
    // Update liquid staker balance
    let dict = get_dict(DICT_LIQUID_STAKERS);
    let current: U512 = storage::dictionary_get(dict, &make_key(&caller))
        .unwrap_or_revert()
        .unwrap_or(U512::zero());
    storage::dictionary_put(dict, &make_key(&caller), current - cspr_amount);
    
    // Update totals
    let total_liquid: U512 = get_key(KEY_TOTAL_LIQUID_STAKED);
    set_key(KEY_TOTAL_LIQUID_STAKED, total_liquid - cspr_amount);
    
    let total_staked: U512 = get_key(KEY_TOTAL_STAKED);
    set_key(KEY_TOTAL_STAKED, total_staked - cspr_amount);
}

#[no_mangle]
pub extern "C" fn get_liquid_stake_ratio() {
    let ratio: U512 = get_key(KEY_LIQUID_STAKING_RATIO);
    runtime::ret(CLValue::from_t(ratio).unwrap_or_revert());
}

#[no_mangle]
pub extern "C" fn get_stcspr_balance() {
    let owner: Key = runtime::get_named_arg(ARG_OWNER);
    let dict = get_dict(DICT_STCSPR_BALANCES);
    let balance: U512 = storage::dictionary_get(dict, &make_key(&owner))
        .unwrap_or_revert()
        .unwrap_or(U512::zero());
    runtime::ret(CLValue::from_t(balance).unwrap_or_revert());
}

// Limit Orders & Stop Loss functions
#[no_mangle]
pub extern "C" fn create_limit_order() {
    let amount: U512 = runtime::get_named_arg(ARG_AMOUNT);
    let price: U512 = runtime::get_named_arg(ARG_PRICE);
    let order_type: u8 = runtime::get_named_arg(ARG_ORDER_TYPE); // 0=buy, 1=sell
    let caller = Key::from(runtime::get_caller());
    
    let counter: u64 = get_key(KEY_ORDER_COUNTER);
    let order_id = counter + 1;
    set_key(KEY_ORDER_COUNTER, order_id);
    
    let dict = get_dict(DICT_ORDERS);
    let key = format!("{}_{}", make_key(&caller), order_id);
    let order_data = format!("{}:{}:{}", amount, price, order_type);
    storage::dictionary_put(dict, &key, order_data);
}

#[no_mangle]
pub extern "C" fn create_stop_loss() {
    let amount: U512 = runtime::get_named_arg(ARG_AMOUNT);
    let trigger_price: U512 = runtime::get_named_arg(ARG_TRIGGER_PRICE);
    let caller = Key::from(runtime::get_caller());
    
    let counter: u64 = get_key(KEY_ORDER_COUNTER);
    let order_id = counter + 1;
    set_key(KEY_ORDER_COUNTER, order_id);
    
    let dict = get_dict(DICT_ORDERS);
    let key = format!("{}_{}", make_key(&caller), order_id);
    let order_data = format!("{}:{}:stop", amount, trigger_price);
    storage::dictionary_put(dict, &key, order_data);
}

#[no_mangle]
pub extern "C" fn cancel_order() {
    let order_id: u64 = runtime::get_named_arg(ARG_ORDER_ID);
    let caller = Key::from(runtime::get_caller());
    
    let dict = get_dict(DICT_ORDERS);
    let key = format!("{}_{}", make_key(&caller), order_id);
    storage::dictionary_put(dict, &key, String::from("cancelled"));
}

#[no_mangle]
pub extern "C" fn execute_order() {
    let order_id: u64 = runtime::get_named_arg(ARG_ORDER_ID);
    let owner: Key = runtime::get_named_arg(ARG_OWNER);
    
    let dict = get_dict(DICT_ORDERS);
    let key = format!("{}_{}", make_key(&owner), order_id);
    storage::dictionary_put(dict, &key, String::from("executed"));
}
// Entry points
fn create_entry_points() -> EntryPoints {
    let mut eps = EntryPoints::new();
    
    eps.add_entry_point(EntryPoint::new(
        "name",
        vec![],
        CLType::String,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    eps.add_entry_point(EntryPoint::new(
        "symbol",
        vec![],
        CLType::String,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    eps.add_entry_point(EntryPoint::new(
        "decimals",
        vec![],
        CLType::U8,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    eps.add_entry_point(EntryPoint::new(
        "total_supply",
        vec![],
        CLType::U256,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    eps.add_entry_point(EntryPoint::new(
        "balance_of",
        vec![Parameter::new(ARG_OWNER, CLType::Key)],
        CLType::U256,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    eps.add_entry_point(EntryPoint::new(
        "transfer",
        vec![
            Parameter::new(ARG_RECIPIENT, CLType::Key),
            Parameter::new(ARG_AMOUNT, CLType::U256),
        ],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    eps.add_entry_point(EntryPoint::new(
        "approve",
        vec![
            Parameter::new(ARG_SPENDER, CLType::Key),
            Parameter::new(ARG_AMOUNT, CLType::U256),
        ],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    eps.add_entry_point(EntryPoint::new(
        "allowance",
        vec![
            Parameter::new(ARG_OWNER, CLType::Key),
            Parameter::new(ARG_SPENDER, CLType::Key),
        ],
        CLType::U256,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    eps.add_entry_point(EntryPoint::new(
        "stake",
        vec![Parameter::new(ARG_AMOUNT, CLType::U512)],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    eps.add_entry_point(EntryPoint::new(
        "unstake",
        vec![Parameter::new(ARG_AMOUNT, CLType::U512)],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    eps.add_entry_point(EntryPoint::new(
        "get_stake",
        vec![Parameter::new(ARG_OWNER, CLType::Key)],
        CLType::U512,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    eps.add_entry_point(EntryPoint::new(
        "open_position",
        vec![
            Parameter::new(ARG_AMOUNT, CLType::U512),
            Parameter::new("leverage", CLType::U32),
        ],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    eps.add_entry_point(EntryPoint::new(
        "close_position",
        vec![Parameter::new("position_id", CLType::U64)],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    eps.add_entry_point(EntryPoint::new(
        "vault_deposit",
        vec![Parameter::new(ARG_AMOUNT, CLType::U512)],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    eps.add_entry_point(EntryPoint::new(
        "vault_withdraw",
        vec![Parameter::new(ARG_AMOUNT, CLType::U512)],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    eps.add_entry_point(EntryPoint::new(
        "stake_for_liquid",
        vec![Parameter::new(ARG_AMOUNT, CLType::U512)],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    eps.add_entry_point(EntryPoint::new(
        "unstake_liquid",
        vec![Parameter::new(ARG_AMOUNT, CLType::U512)],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    eps.add_entry_point(EntryPoint::new(
        "get_liquid_stake_ratio",
        vec![],
        CLType::U512,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    eps.add_entry_point(EntryPoint::new(
        "get_stcspr_balance",
        vec![Parameter::new(ARG_OWNER, CLType::Key)],
        CLType::U512,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    eps.add_entry_point(EntryPoint::new(
        "create_limit_order",
        vec![
            Parameter::new(ARG_AMOUNT, CLType::U512),
            Parameter::new(ARG_PRICE, CLType::U512),
            Parameter::new(ARG_ORDER_TYPE, CLType::U8),
        ],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    eps.add_entry_point(EntryPoint::new(
        "create_stop_loss",
        vec![
            Parameter::new(ARG_AMOUNT, CLType::U512),
            Parameter::new(ARG_TRIGGER_PRICE, CLType::U512),
        ],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    eps.add_entry_point(EntryPoint::new(
        "cancel_order",
        vec![Parameter::new(ARG_ORDER_ID, CLType::U64)],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    eps.add_entry_point(EntryPoint::new(
        "execute_order",
        vec![
            Parameter::new(ARG_ORDER_ID, CLType::U64),
            Parameter::new(ARG_OWNER, CLType::Key),
        ],
        CLType::Unit,
        EntryPointAccess::Public,
        EntryPointType::Called,
    ).into());
    
    eps
}

// Install
#[no_mangle]
pub extern "C" fn call() {
    let contract_name: String = runtime::get_named_arg(ARG_CONTRACT_NAME);
    let token_name: String = runtime::get_named_arg(ARG_TOKEN_NAME);
    let token_symbol: String = runtime::get_named_arg(ARG_TOKEN_SYMBOL);
    let total_supply: U256 = runtime::get_named_arg(ARG_TOTAL_SUPPLY);
    let admin: Key = runtime::get_caller().into();
    
    let mut named_keys = NamedKeys::new();
    
    named_keys.insert(KEY_NAME.into(), storage::new_uref(token_name).into());
    named_keys.insert(KEY_SYMBOL.into(), storage::new_uref(token_symbol).into());
    named_keys.insert(KEY_DECIMALS.into(), storage::new_uref(9u8).into());
    named_keys.insert(KEY_TOTAL_SUPPLY.into(), storage::new_uref(total_supply).into());
    named_keys.insert(KEY_ADMIN.into(), storage::new_uref(admin).into());
    named_keys.insert(KEY_PAUSED.into(), storage::new_uref(false).into());
    named_keys.insert(KEY_TOTAL_STAKED.into(), storage::new_uref(U512::zero()).into());
    named_keys.insert(KEY_MAX_LEVERAGE.into(), storage::new_uref(100u32).into());
    named_keys.insert(KEY_VAULT_TOTAL.into(), storage::new_uref(U512::zero()).into());
    named_keys.insert(KEY_LIQUID_STAKING_RATIO.into(), storage::new_uref(U512::from(1000000u64)).into());
    named_keys.insert(KEY_TOTAL_LIQUID_STAKED.into(), storage::new_uref(U512::zero()).into());
    named_keys.insert(KEY_ORDER_COUNTER.into(), storage::new_uref(0u64).into());
    
    let balances = storage::new_dictionary(DICT_BALANCES).unwrap_or_revert();
    named_keys.insert(DICT_BALANCES.into(), balances.into());
    storage::dictionary_put(balances, &make_key(&admin), total_supply);
    
    let allowances = storage::new_dictionary(DICT_ALLOWANCES).unwrap_or_revert();
    named_keys.insert(DICT_ALLOWANCES.into(), allowances.into());
    
    let stakers = storage::new_dictionary(DICT_STAKERS).unwrap_or_revert();
    named_keys.insert(DICT_STAKERS.into(), stakers.into());
    
    let positions = storage::new_dictionary(DICT_POSITIONS).unwrap_or_revert();
    named_keys.insert(DICT_POSITIONS.into(), positions.into());
    
    let vault = storage::new_dictionary(DICT_VAULT).unwrap_or_revert();
    named_keys.insert(DICT_VAULT.into(), vault.into());
    
    let liquid_stakers = storage::new_dictionary(DICT_LIQUID_STAKERS).unwrap_or_revert();
    named_keys.insert(DICT_LIQUID_STAKERS.into(), liquid_stakers.into());
    
    let stcspr_balances = storage::new_dictionary(DICT_STCSPR_BALANCES).unwrap_or_revert();
    named_keys.insert(DICT_STCSPR_BALANCES.into(), stcspr_balances.into());
    
    let orders = storage::new_dictionary(DICT_ORDERS).unwrap_or_revert();
    named_keys.insert(DICT_ORDERS.into(), orders.into());
    
    let entry_points = create_entry_points();
    
    let (contract_hash, _version) = storage::new_contract(
        entry_points,
        Some(named_keys),
        Some(contract_name.clone()),
        Some(format!("{}_access", contract_name)),
        None,
    );
    
    runtime::put_key(&contract_name, contract_hash.into());
}
