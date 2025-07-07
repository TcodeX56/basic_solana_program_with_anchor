use anchor_lang::prelude::*;

declare_id!("3DkqAuoq8wsiqVhtr2Y3L5Tcbpdskb7MaeVueo8W6Zyf");

#[program]
pub mod favorites {
    use super::*;

    pub fn set_favorites(
        context: Context<set_favorites>,
        number: u64,
        color: String,
        hobbies: Vec<String>
    ) -> Result<()> {
        let user_public_key = context.accounts.user.key();

        msg!("Greeting from{}", context.program_id);
        msg!("User {user_public_key}'s favorite number is {number} , favorite colore is :{color}");

        msg!("User's hobbies are :{:?}", hobbies);

        context.accounts.favorite.set_inner(Favorites {
            number,
            color,
            hobbies,
        });

        Ok(())
    }
}

#[account]
#[derive(InitSpace)]
pub struct Favorites {
    pub number: u64,
    #[max_len(50)]
    pub color: String,

    #[max_len(5, 50)]
    pub hobbies: Vec<String>,
}

#[derive(Accounts)]
pub struct set_favorites<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init_if_needed,
        payer = user,
        space = ANCHOR_DISCRIMINATOR_SIZE + Favorites::INIT_SPACE,
        seeds = [b"favorites", user.key().as_ref()],
        bump
    )]
    pub favorite: Account<'info, Favorites>,
    pub system_program: Program<'info, System>,
}

pub const ANCHOR_DISCRIMINATOR_SIZE: usize = 8;
