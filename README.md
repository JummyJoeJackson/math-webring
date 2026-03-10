# Math Webring
A webring for Mathematics students and alumni at the University of Waterloo in Ontario, Canada.

<img width="999" height="666" alt="image" src="https://github.com/user-attachments/assets/b32841b4-96f6-4d8d-8dc3-576098db505f" />

## Whats a Webring
A webring is a group of websites linked together in a circular manner, centered around a common theme. They were big in the early internet and later got replaced by blogs and social medias. The idea behind the Math Webring is to have a central place list all websites of current and prior Math students and make them more discoverable/increase traffic.

## Joining the Webring

1. Add the webring widget to your website HTML ([template below](#widget-template)). Generally, you should add it to the footer.
2. Fork this repo and add your information to the **BOTTOM** of `webringData[]` in `index.html` following this format:
   ```json
   {
     "name": "Your Name",
     "website": "https://your-website.com",
     "year": "20XX"
   }
   ```
3. Submit a Pull Request! We'll try to review as fast as we can.

## Widget template

<img width="250" height="167" alt="math-webring-example" src="https://github.com/user-attachments/assets/a6a2a0f7-6d5b-4046-ba46-44b4855fa582" />

Since every website is unique, we suggest you add your own style to the pi. However, if you can't make one off the dome here are some examples to get you started:

#### HTML:

```html
<div style="display: flex; align-items: center; gap: 8px;">
    <a href="https://math-webring.vercel.app/#your-site-here?nav=prev">←</a>
    <a href="https://math-webring.vercel.app/#your-site-here" target="_blank">
        <img src="https://math-webring.vercel.app/math-webring-pink.svg" alt="Math Webring" style="width: 24px; height: auto; opacity: 0.8;"/>
    </a>
    <a href="https://math-webring.vercel.app/#your-site-here?nav=next">→</a>
</div>
<!-- Replace 'your-site-here' with your actual site URL -->
```

#### JSX:

```jsx
<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <a href='https://math-webring.vercel.app/#your-site-here?nav=prev'>←</a>
    <a href='https://math-webring.vercel.app/#your-site-here' target='_blank'>
        <img
            src='https://math-webring.vercel.app/math-webring-pink.svg'
            alt='Math Webring'
            style={{ width: '24px', height: 'auto', opacity: 0.8 }}
        />
    </a>
    <a href='https://math-webring.vercel.app/#your-site-here?nav=next'>→</a>
</div>
// Replace 'your-site-here' with your actual site URL
```

Generally, use `math-webring-pink.svg` as it works in both dark and light-themed websites. Feel free to host the icon locally if you encounter HTTPS issues / styling issues.

## Alternative Icons Sources

- Black: `https://math-webring.vercel.app/math-webring-black.svg`
- White: `https://math-webring.vercel.app/math-webring-white.svg`
- Pink: `https://math-webring.vercel.app/math-webring-pink.svg`

If none of these quite work for you, feel free to make your own. If you're using React, start with [MathWebringIcon.tsx](./MathWebringIcon.tsx).

## Q&A

#### _Do CS students count as Math?_

> Unfortunately, since there is already a [CS Webring](https://cs.uwatering.com/) we suggest that CS students join that instead.

#### _Do you accept alumni and post-grad students?_

> Yep, as long as you studied Mathematics or are currently studying it

#### _What about related programs, double degrees (ie FARM, Math BBA), etc?_

> 👍

## Credits & Inspiration

This project is heavily inspired by [UWatering](https://cs.uwatering.com/) and [SE Webring](https://se-webring.xyz/).
