module one_pet::battle_arena {
    use one::object::{Self, UID};
    use one::transfer;
    use one::tx_context::TxContext;
    use one::clock::{Self, Clock};
    use std::string::{Self, String};
    use one_pet::game::{Self, Pet, get_pet_name, get_pet_hunger, get_pet_happiness, get_pet_stage};

    // === CONSTANTS ===
    const MAX_HEALTH: u64 = 100;
    const ATTACK_VARIANCE: u64 = 15;

    // === ERROR CODES ===
    const E_PET_ALREADY_IN_BATTLE: u64 = 1;
    const E_NOT_PET_OWNER: u64 = 2;
    const E_SAME_PET: u64 = 3;
    const E_BATTLE_FINISHED: u64 = 4;

    // === STRUCTS ===

    // Battle Medal NFT - awarded to winner
    public struct BattleMedal has key, store {
        id: UID,
        winner_pet_name: String,
        loser_pet_name: String,
        battle_timestamp: u64,
        rounds_survived: u8,
    }

    // Active Battle State
    public struct Battle has key {
        id: UID,
        pet1_id: address,
        pet2_id: address,
        pet1_owner: address,
        pet2_owner: address,
        pet1_current_health: u64,
        pet2_current_health: u64,
        pet1_name: String,
        pet2_name: String,
        current_turn: u8, // 1 or 2
        round_number: u8,
        is_finished: bool,
        winner: u8, // 0 = ongoing, 1 = pet1, 2 = pet2
        battle_log: vector<String>,
    }

    // === PUBLIC FUNCTIONS ===

    /// Initiate a battle challenge
    public fun initiate_battle(
        challenger_pet: &Pet,
        opponent_pet_id: address,
        opponent_owner: address,
        clock: &Clock,
        ctx: &mut TxContext
    ): Battle {
        // Basic validation
        let challenger_id = object::id_address(challenger_pet);
        assert!(challenger_id != opponent_pet_id, E_SAME_PET);

        // Create battle log
        let mut log = vector::empty<String>();
        vector::push_back(&mut log, string::utf8(b"Battle Started!"));

        Battle {
            id: object::new(ctx),
            pet1_id: challenger_id,
            pet2_id: opponent_pet_id,
            pet1_owner: ctx.sender(),
            pet2_owner: opponent_owner,
            pet1_current_health: MAX_HEALTH,
            pet2_current_health: MAX_HEALTH,
            pet1_name: get_pet_name(challenger_pet),
            pet2_name: string::utf8(b"Opponent"), // Will be updated
            current_turn: 1,
            round_number: 1,
            is_finished: false,
            winner: 0,
            battle_log: log,
        }
    }

    /// Execute a battle round (simplified for prototype)
    public fun battle_round(
        battle: &mut Battle,
        attacker_pet: &Pet,
        defender_pet: &Pet,
        clock: &Clock,
        ctx: &mut TxContext
    ) {
        assert!(!battle.is_finished, E_BATTLE_FINISHED);

        let attacker_id = object::id_address(attacker_pet);
        
        // Determine who's attacking
        let is_pet1_attacking = attacker_id == battle.pet1_id;
        
        // Calculate damage based on pet stats
        let attack_power = calculate_attack(attacker_pet, clock);
        let defense_power = calculate_defense(defender_pet);
        
        let damage = if (attack_power > defense_power) {
            attack_power - defense_power
        } else {
            5 // Minimum damage
        };

        // Apply damage
        if (is_pet1_attacking) {
            if (battle.pet2_current_health > damage) {
                battle.pet2_current_health = battle.pet2_current_health - damage;
            } else {
                battle.pet2_current_health = 0;
                battle.is_finished = true;
                battle.winner = 1;
            };
            add_battle_log(battle, string::utf8(b"Pet1 attacks for damage!"));
        } else {
            if (battle.pet1_current_health > damage) {
                battle.pet1_current_health = battle.pet1_current_health - damage;
            } else {
                battle.pet1_current_health = 0;
                battle.is_finished = true;
                battle.winner = 2;
            };
            add_battle_log(battle, string::utf8(b"Pet2 counterattacks!"));
        };

        // Switch turn
        battle.current_turn = if (battle.current_turn == 1) { 2 } else { 1 };
        battle.round_number = battle.round_number + 1;

        // Award medal if battle finished
        if (battle.is_finished) {
            award_medal(battle, clock, ctx);
        };
    }

    /// Award medal to winner
    fun award_medal(battle: &mut Battle, clock: &Clock, ctx: &mut TxContext) {
        let winner_address = if (battle.winner == 1) {
            battle.pet1_owner
        } else {
            battle.pet2_owner
        };

        let (winner_name, loser_name) = if (battle.winner == 1) {
            (battle.pet1_name, battle.pet2_name)
        } else {
            (battle.pet2_name, battle.pet1_name)
        };

        let medal = BattleMedal {
            id: object::new(ctx),
            winner_pet_name: winner_name,
            loser_pet_name: loser_name,
            battle_timestamp: clock::timestamp_ms(clock),
            rounds_survived: battle.round_number,
        };

        transfer::public_transfer(medal, winner_address);
        add_battle_log(battle, string::utf8(b"Victory medal awarded!"));
    }

    // === HELPER FUNCTIONS ===

    fun calculate_attack(pet: &Pet, _clock: &Clock): u64 {
        // Attack = Base(20) + (100-hunger)/2 + happiness/4 + stage_bonus
        let hunger = get_pet_hunger(pet);
        let happiness = get_pet_happiness(pet);
        let stage = get_pet_stage(pet);
        
        let base = 20;
        let hunger_mod = if (hunger < 100) { (100 - hunger) / 2 } else { 0 };
        let happiness_mod = happiness / 4;
        let stage_bonus = (stage as u64) * 5;
        
        base + hunger_mod + happiness_mod + stage_bonus
    }

    fun calculate_defense(pet: &Pet): u64 {
        // Defense = Base(10) + happiness/5 + stage_bonus
        let happiness = get_pet_happiness(pet);
        let stage = get_pet_stage(pet);
        
        let base = 10;
        let happiness_mod = happiness / 5;
        let stage_bonus = (stage as u64) * 3;
        
        base + happiness_mod + stage_bonus
    }

    fun add_battle_log(battle: &mut Battle, message: String) {
        vector::push_back(&mut battle.battle_log, message);
    }

    // === VIEW FUNCTIONS ===

    public fun get_battle_status(battle: &Battle): (u64, u64, u8, bool) {
        (battle.pet1_current_health, battle.pet2_current_health, battle.current_turn, battle.is_finished)
    }

    public fun get_winner(battle: &Battle): u8 {
        battle.winner
    }
}
