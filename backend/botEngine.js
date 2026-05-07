import { query } from "./db.js";

const BOT_PLAYERS = [
  ["900000001", "alex_77", "aggressive", "https://i.pinimg.com/736x/4d/9b/d0/4d9bd02d718c4909b69b2618e707f0e0.jpg"],
  ["900000002", "maksim", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrUsmO133AFxw2fDUbWzemC27xBUKL1MFpaA&s"],
  ["900000003", "denis_01", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJiHE_tGKEs93mskoCU0gZ_I34wAQw1VWUpw&s"],
  ["900000004", "leo", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtBE6KTerqkBeMU1uRVioAa8_2A5am9n4e4w&s"],
  ["900000005", "timur", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyAbvTZ-eu2ZuETNaDwD-Fl-_hCAhIzBb5-g&s"],
  ["900000006", "nick99", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkUMjTBWiv5XkRfbalr8a7QfSiw2SilItNPA&s"],

  ["900000007", "ryan", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvVTEgPpEXGiGCePHk81PAVSMHILxnp34rCg&s"],
  ["900000008", "adam_x", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrb3eL3Lr-xsEmfHyW-l3GlsBB0HPGG2iQvw&s"],
  ["900000009", "marko", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR5KAzOehBCHcqXIKklMa8ZGiqAa_1GV94oeiidlUYyThZJsRklE5jyc5w&s"],
  ["900000010", "chris_88", "medium", "https://i.pravatar.cc/150?img=24"],
  ["900000011", "sam", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ-j0SlWpRYz1lgkq7zLvEkEhc-9XzZrcLPg&s"],
  ["900000012", "daniel", "medium", "https://avatars.mds.yandex.net/get-shedevrum/11451254/img_d30bb68e058211efa5849a79ffaf5bd2/orig"],
  ["900000013", "oliver_7", "medium", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQMAAADCCAMAAAB6zFdcAAAAkFBMVEX+AAD8AwD6BADBBQfXBQj9AQX5BAP6BQb1BQ3zBQb0BgPtBAfpBwvqCgfOBQyqBQvTBQu8CgmfCQriCAi0BgnNBg/MBgfJLxudcTegbzKdcjOsXCoABQuPAwg1BQqcBg5wBxB7BxNbBgt1BgmUcDk262pA5GmCuVahAACYCAvSCQarBgi6RSV8lkqAkkiXdjuaz4EoAAABLElEQVR4nO3Uy3LTQBAF0BlJI1mRJcvWAwIEh5chmIT//zuUClSqXGzl1Tmb6d2dru6ZEMuYYgxlFhchxSzEsoxZDDGsLVuyqyo9H1dIuwz/Vyxdx2qTNvVNk7ah7Xb9vjm0YWjGfE6rX+PmvC3GqWgOUz5vV0+7EN+8vb199z6rt8vk8w93H6duHot2PO7b+/qcUlfNeb/+ZIr7bn+cjs2nu89fitXTLn39djqdvv8YH5Y9qPt2GOqiLkL+Mx92/bxcbir6bv09aB6m6bDbN1O2Ow+rp1369fj09Pi7Hjbl83MIf59jemk7vpbrSuElJVUhXCPvf7LXjwEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAK7uD/XQCpdnDtIoAAAAAElFTkSuQmCC"],

  ["900000014", "mike_crypto", "neutral", "https://cs9.pikabu.ru/post_img/2016/11/05/8/1478348889113012245.jpg"],
  ["900000015", "tony", "neutral", "https://wallpaper.forfun.com/fetch/49/4903ea88841e11ebe216139e70aa0c98.jpeg"],
  ["900000016", "kevindeb", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3cBxFhdLKzPJTd7rABBDj-kO_4WqUah6xwQ&s"],
  ["900000017", "jacklore", "neutral", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJQAAACUCAMAAABC4vDmAAAAA1BMVEVGm94gs2CqAAAALElEQVR4nO3BMQEAAADCoPVPbQwfoAAAAAAAAAAAAAAAAAAAAAAAAAAAAHgZViQAAd2fpbUAAAAASUVORK5CYII="],
  ["900000018", "evan", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQF0QMj_YHqItYwHB2kdbNKP6JsqeE88r28Rw&s"],
  ["900000019", "noah", "neutral", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAAAA1BMVEWZ/5lPT2g3AAAASElEQVR4nO3BgQAAAADDoPlTX+AIVQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwDcaiAAFXD1ujAAAAAElFTkSuQmCC"],
  ["900000020", "liamak", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtS1C8WvMvlNVofTBFMBZ6S4EpMs9AJv3cWA&s"],

  ["900000021", "amir_07", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfyVwr7ST_DCT4fmH4tt1u69WQ-prN48iqWw&s"],
  ["900000022", "roma_x", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTf_TUedg_Cuz6ZztJ2IZGbAimNxdM7iZhY-Q&s"],
  ["900000023", "daniil_91", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREtHsdvQI5Z_I0jRnZISuO2jUQ-91Xf6i9zA&s"],
  ["900000024", "sergo", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6FdU7EPS8udoir1DPmKvXye9oxH076V2zrA&s"],
  ["900000025", "matvey_13", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKaCID2Yhnb8G4aOnu8B0XtgEVOwr9mCvzcg&s"],
  ["900000026", "arslan", "aggressive", "https://99px.ru/sstorage/1/2026/05/image_10105260706486415303.jpg"],
  ["900000027", "vladik", "aggressive", "https://99px.ru/sstorage/1/2026/03/10303261230558566.jpg"],
  ["900000028", "egor_88", "aggressive", "https://99px.ru/sstorage/1/2026/02/image_10202260203251267242.jpg"],
  ["900000029", "ruslanov", "aggressive", "https://99px.ru/sstorage/1/2025/12/image_11412251103547183635.jpg"],
  ["900000030", "kiril_22", "aggressive", "https://99px.ru/sstorage/1/2025/09/image_13009251739234057141.jpg"],

  ["900000031", "artemka", "medium", "https://commons.wikimedia.org/wiki/Special:FilePath/Doge_meme.png"],
  ["900000032", "dan_xx", "medium", "https://forummaxi.ru/uploads/profile/photo-25379.gif"],
  ["900000033", "slava_05", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCZteVArtjY14cVav_Yb976-9RWCEAOsI605avNQMgEw&s"],
  ["900000034", "ivan4ik", "medium", "https://commons.wikimedia.org/wiki/Special:FilePath/Sample_User_Icon.png"],
  ["900000035", "maks_777", "medium", "https://commons.wikimedia.org/wiki/Special:FilePath/Doge_meme_example.jpg"],

  ["900000036", "temka", "medium", "https://commons.wikimedia.org/wiki/Special:FilePath/Avatar%201%20cerca.png"],
  ["900000037", "azizbek", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-0ag62Usm7d25FfFFDK8vaOMcVJ0jS7L-pw&s"],
  ["900000038", "murad_11", "medium", "https://commons.wikimedia.org/wiki/Special:FilePath/Chlod%20%28avatar%29.png"],
  ["900000039", "emirhan", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-ASMTG7K58C7_VUxJ3mb_rVdjAFxuLXZ9KvJk0JPeZg&s"],
  ["900000040", "volkan_34", "medium", "https://commons.wikimedia.org/wiki/Special:FilePath/Dedalium%20icon%20128x128.png"],

  ["900000041", "mert_09", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-fvrNNJ9jxye07lLVTI25btfzWxMn5_0haw&s"],
  ["900000042", "kaantr", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRmNP8ahMk9Hr8DcGx2Bn_qxX0U9ijc8uGxzg&s"],
  ["900000043", "ilya_17", "medium", "https://commons.wikimedia.org/wiki/Special:FilePath/CityBattle%20Virtual%20Earth%20avatar.jpg"],
  ["900000044", "nikitos", "medium", "https://commons.wikimedia.org/wiki/Special:FilePath/Bluesign-avatar.png"],
  ["900000045", "sasha_q", "medium", "https://commons.wikimedia.org/wiki/Special:FilePath/Barrow%20Avatar.jpg"],

  ["900000046", "andrey", "neutral", "https://99px.ru/sstorage/1/2024/12/image_10112240928587939284.jpg"],
  ["900000047", "pasha_01", "neutral", "https://99px.ru/sstorage/1/2024/02/image_11502241202505160441.gif"],
  ["900000048", "stason", "neutral", "https://99px.ru/sstorage/1/2024/10/image_12910241918402121245.jpg"],
  ["900000049", "leha_90", "neutral", "https://avatarko.ru/img/kartinka/33/maska_film_galstuk_33913.jpg"],
  ["900000050", "miron", "neutral", "https://falcon-eyes.ru/upload/iblock/74e/yx2louwjrh7v8uk5z5ajtw9hv5tlcut0.jpg"],
  ["900000051", "ramil", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDzCJTLYIeG4qtmkDln7uaBop7MXX1DgulOg&s"],
  ["900000052", "arsen_4", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSEyNm7G0rZ7BN7i3kJTwuupvXjuSZeDr_Jw&s"],
  ["900000053", "yusuf", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpl90RC7MdWdTdiCZY5320ooR-ZkrcZgL0XA&s"],
  ["900000054", "enes", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBXmp4G8FsAP6A1FxmhbxrjTH_G3mTETPZGA&s"],
  ["900000055", "burak_61", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ1ks8ZeR0QTuTn4KA3dIGRztfmgvEvX7fY2A&s"],
  ["900000056", "kerem", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSka0Zt8-D4z2-D2ia4XnuDniUn6T9GwNBSSA&s"],
  ["900000057", "selim", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbF6xC9ekW19yE-nD68sMccayNHTc2PKprJQ&s"],
  ["900000058", "taha_19", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtNS-E_sO8cuYYi3Bkg4L6YUNMLqTkLQCk-A&s"],
  ["900000059", "oleg_ua", "neutral", "https://avatarko.ru/img/kartinka/2/muzhchina_kapyushon_1806.jpg"],
  ["900000060", "misha", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROxLB33uNtvS-Gh9K8lMTCkXLCJsbx0P22jJ4sHhzkwA&s"],
  ["900000061", "dimon_33", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ7-aOQRfF9mVJEhtPT7eMQI2XMrhD3V4_V2A&s"],
  ["900000062", "vadimka", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWzF5YZbGDQTup8jIlF8jp00_WpT2nf_gu0A&s"],
  ["900000063", "goga", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSPtb0AVxmOo-qxteP5seN3tpc4OG3FIJ_JA&s"],
  ["900000064", "marat", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQpV1ov2YmU5sRHCXq8QHQxtFTo24V0BS3pRA&s"],
  ["900000065", "renat_21", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR20IRWbANpQ9o4PvWmNtHToypU4-xmSdHvMw&s"],
  ["900000066", "tigran", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTXHSoCvAx1HQvNBsR8TwmGYhPUsqDmT9q48Hhl0NjfBw&s"],

  ["900000067", "nightzz", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8XrKn1YlzKZDQMxL0WzEAdQFrrGIUmVDYCyxntbXWSA&s"],
  ["900000068", "venom_x", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlHnH_2cyOcEGNsxAIT3p3wEVnO-4Us8Jt2A&s"],
  ["900000069", "toxicboy", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjzgnt_bl1Ng8VXHIasiMf9Qsk3sqdinN69A&s"],
  ["900000070", "ghostik", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtk0aY0px1G_ybG4wAfBsmbqKMpHxluKs3vVLB0LjWKQ&s"],
  ["900000071", "darkwave", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRC-2-Ofu5vhBdDNB76_pGwbC0D1UpEouJwbCa04CPjWw&s"],

  ["900000072", "akira_x", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJ-uNzBa3XIVkcPkNYHq9AlEiETE6ttqq3Mw&s"],
  ["900000073", "midnight", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRArNM-2bSaRVb7FyZJcAzh-Xmc838Hm5JeA&s"],
  ["900000074", "voidzero", "aggressive", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjdl7alpeH9ApQecnVzsFgmnDP7BCsLByG-A&s"],

  ["900000075", "animekid", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZmckou1lEb990WjuQppUuiBw9RYEAlwb1ng&s"],
  ["900000076", "rider_77", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVjzR82q2jiVjcz4TL6iIGJDsV1f_w21I1ew&s"],
  ["900000077", "neonix", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3q8YrZBG31SRMoObJJjfCkTPy2PMPdEDqzA&s"],
  ["900000078", "zenqq", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSy27fhDdNl2VJqDOOn_qKgrXHJaasbxMdUGA&s"],
  ["900000079", "crazycat", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-bBT9ez3ajmrpVo2T1qcGrReQ42Ehwvy93w&s"],
  ["900000080", "sleepyy", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOBO-3iWTwmCG_OINW8pkGXocGWUdDPa2Ndg&s"],
  ["900000081", "frosty", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTNsJbLQJViT0hH7Ijd3f-HHrCjyVGhNVl2Ng&s"],
  ["900000082", "moonlight", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRqSDAJeuT6qOWVNDr0H3aUUefosjj4klYC5g&s"],
  ["900000083", "shadowww", "medium", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTklhJvKjAL4HDrztbqsEV6S0_BcHv5gor-PSFNalMd_w&s"],

  ["900000084", "kot_blin", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKE_8_7IfEFzjOQbsAEyvtgOF4PIJCRihFEA&s"],
  ["900000085", "mrx_void", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcReYL0g-qefXHRO9QJcU6CU5vOi8B2s-ZQvHQ&s"],
  ["900000086", "lunar_qq", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSITd8tGFaEuIMcoVsMOYd_IemNGHO7NodW7Q&s"],
  ["900000087", "s1lent", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1hkqG7S81tLAIqHDVYrk25ugnOT9hmaX-VQ&s"],
  ["900000088", "krypton", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTi4mjxaqxX1Qa_86JopjkGQsyIrSZX0yvmdA&s"],
  ["900000089", "reaperx", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTyYEXLxpve6Ttcl7cHpS7DG8Njlu_GIwDFeQ&s"],
  ["900000090", "wavezz", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEmMoEu_Z3KRvzHNFJJQu01fmsLfnxZ2pk9w&s"],
  ["900000091", "voidik", "neutral", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlxwUmjD08HqLW7tNZ-hMmIrgA5WZVXho7wtBmMZs1kw&s"],

  ["900000092", "darkson", "aggressive", "https://cdn.phototourl.com/free/2026-05-06-2236f552-dd5f-48e8-84ff-350b476c7a22.jpg"],
["900000093", "belok_7", "aggressive", "https://cdn.phototourl.com/free/2026-05-06-1dc77b1b-f311-4629-8130-c8303887c1ca.jpg"],
["900000094", "blackray", "aggressive", "https://cdn.phototourl.com/free/2026-05-06-319c7344-0088-43f1-8ca9-c9c632782075.png"],
["900000095", "toxa_99", "aggressive", "https://cdn.phototourl.com/free/2026-05-06-bb39baa1-d9a9-48ec-a139-7ac4179e426c.jpg"],
["900000096", "kain_x", "aggressive", "https://cdn.phototourl.com/member/2026-05-06-6e665875-aca8-4cdf-8b33-07e4abf64e64.jpg"],
["900000097", "stormik", "aggressive", "https://cdn.phototourl.com/member/2026-05-06-4685d17d-5eb9-4a27-a981-b25b4ad6d8ce.jpg"],
["900000098", "drak0n", "aggressive", "https://cdn.phototourl.com/member/2026-05-06-66e0ea70-7370-4f4f-887e-695095ffb23c.jpg"],
["900000099", "viper_01", "aggressive", "https://cdn.phototourl.com/member/2026-05-06-bad81fb4-6f0f-448b-abef-e2f5ba29c351.jpg"],
["900000100", "skullman", "aggressive", "https://cdn.phototourl.com/member/2026-05-06-f3a6769c-04b1-4cc2-82a5-40228e033997.jpg"],
["900000101", "razorq", "aggressive", "https://cdn.phototourl.com/member/2026-05-06-2b550e81-ed6d-4a53-8b6c-d1c76b033fa2.jpg"],
["900000102", "xander", "aggressive", "https://cdn.phototourl.com/member/2026-05-06-3d3dd039-4e99-4b46-b937-5fcb177f12d1.jpg"],
["900000103", "morgan_88", "aggressive", "https://cdn.phototourl.com/member/2026-05-06-63cb4c77-d8d2-421a-9403-746475f40eff.jpg"],
["900000104", "demonix", "aggressive", "https://cdn.phototourl.com/member/2026-05-06-e1fb1e1b-632c-4d63-8237-dc8e7527683f.jpg"],
["900000105", "blackfox", "aggressive", ""],
["900000106", "krot_77", "aggressive", ""],

["900000122", "maxon", "medium", "https://cdn.phototourl.com/member/2026-05-06-def53f25-0493-4c57-a2c1-8a2ddb3219a9.jpg"],
["900000123","ilyuxa","medium","/avatars/bot1.jpg"],
["900000124","boris_22","medium","/avatars/bot2.jpg"],
["900000125","danilka","medium","/avatars/bot3.jpg"],
["900000126","kosta_x","medium","/avatars/bot4.jpg"],
["900000127","samir_01","medium","/avatars/bot5.jpg"],
["900000128","adem","medium","/avatars/bot6.jpg"],
["900000129","omer_34","medium","/avatars/bot7.jpg"],
["900000130","furkan","medium","/avatars/bot8.jpg"],
["900000131","alihan","medium","/avatars/bot9.jpg"],
["900000132","arm_122","medium","/avatars/bot19.jpg"],
["900000133","caner","medium","/avatars/bot11.jpg"],
["900000134","denchik","medium","/avatars/bot12.jpg"],
["900000135","lexa777","medium","/avatars/bot13.jpg"],
["900000136","art_09","medium","/avatars/bot14.jpg"],
["900000137","rustik","medium","/avatars/bot15.jpg"],
["900000138","beka_21","medium","/avatars/bot16.jpg"],
["900000140","murat_x","medium","/avatars/bot17.jpg"],
["900000141","azim_05","medium","/avatars/bot18.jpg"],
["900000142","jokerik","medium","/avatars/bot10.jpg"],
["900000143","keksik","medium","/avatars/bot20.jpg"],
["900000144","orhan","medium","/avatars/bot21.jpg"],
["900000145","selcuk","medium","/avatars/bot22.jpg"],
["900000146","mertcan","medium","/avatars/bot23.jpg"],
["900000147","dima_q","medium","/avatars/bot24.jpg"],
["900000148","stasik","medium","/avatars/bot25.jpg"],
["900000149","mirza","medium","/avatars/bot26.jpg"],
["900000150","turan_10","medium","/avatars/bot27.jpg"],
["900000151","ramazan","medium","/avatars/bot28.jpg"],
["900000152","yagiz","medium","/avatars/bot29.jpg"],
["900000153","pavel_x","medium","/avatars/bot30.jpg"],
["900000154","m1ron","medium","/avatars/bot31.jpg"],
["900000155","leonid","medium","/avatars/bot32.jpg"],
["900000156","hamza","medium","/avatars/bot33.jpg"],

["900000172","ivanov","neutral","/avatars/bot34.jpg"],
["900000173","petya","neutral","/avatars/bot35.jpg"],
["900000174","seriy","neutral","/avatars/bot36.jpg"],
["900000175","andruha","neutral","/avatars/bot37.jpg"],
["900000176","kolyan","neutral","/avatars/bot38.jpg"],
["900000177","tema_44","neutral","/avatars/bot39.jpg"],
["900000178","maksik","neutral","/avatars/bot40.jpg"],
["900000179","kirya","neutral","/avatars/bot41.jpg"],
["900000180","sanek","neutral","/avatars/bot42.jpg"],
["900000181","roman4ik","neutral","/avatars/bot43.jpg"],
["900000182","tolik","neutral","/avatars/bot44.jpg"],
["900000183","vadik","neutral","/avatars/bot45.jpg"],
["900000184","arseniy","neutral","/avatars/bot46.jpg"],
["900000185","matros","neutral","/avatars/bot47.jpg"],
["900000186","bober_1","neutral","/avatars/bot48.jpg"],
["900000187","barsik","neutral","/avatars/bot49.jpg"],
["900000188","kotyara","neutral","/avatars/bot50.jpg"],
["900000189","zheka","neutral","/avatars/bot51.jpg"],
["900000190","vitya","neutral","/avatars/bot52.jpg"],
["900000191","stepan","neutral","/avatars/bot53.jpg"],
["900000192","rus_34","neutral","/avatars/bot54.jpg"],
["900000193","alper","neutral","/avatars/bot55.jpg"],
["900000194","mehmet_7","neutral","/avatars/bot56.jpg"],
["900000195","berkay","neutral","/avatars/bot57.jpg"],
["900000196","efe_09","neutral","/avatars/bot58.jpg"],
["900000197","kaan_35","neutral","/avatars/bot59.jpg"],
["900000198","baris","neutral","/avatars/bot60.jpg"],

["900000199","cem_01","neutral","/avatars/bot61.jpeg"],
["900000200","umut_x","neutral","/avatars/bot62.jpeg"],
["900000201","onur","neutral","/avatars/bot63.jpeg"],
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function nextDelayMinutes(type) {
  if (type === "aggressive") return randomInt(18, 55);
  if (type === "medium") return randomInt(70, 190);
  return randomInt(180, 420);
}

async function getCurrentRewardCycle() {
  const res = await query(`
    SELECT *
    FROM reward_event_cycles
    ORDER BY id DESC
    LIMIT 1
  `);

  if (res.rowCount === 0) return null;

  const c = res.rows[0];
  const now = new Date();

  if (now >= new Date(c.start_at) && now <= new Date(c.stake_end_at)) {
    return { id: c.id, state: "STAKE_ACTIVE" };
  }

  if (now > new Date(c.stake_end_at) && now <= new Date(c.claim_end_at)) {
    return { id: c.id, state: "CLAIM_ACTIVE" };
  }

  return { id: c.id, state: null };
}

async function ensureBotColumns() {
  await query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS is_bot BOOLEAN DEFAULT false,
    ADD COLUMN IF NOT EXISTS bot_type TEXT,
    ADD COLUMN IF NOT EXISTS bot_next_action_at TIMESTAMP
  `);
}

async function ensureBotPlayers() {
  await ensureBotColumns();

  for (const [telegramId, name, type, avatar] of BOT_PLAYERS) {
    const startEnergy =
      type === "aggressive" ? randomInt(350, 700) :
        type === "medium" ? randomInt(180, 360) :
          randomInt(90, 180);

    const firstDelay = randomInt(1, 180);
    await query(
      `
      INSERT INTO users (
        telegram_id,
        name,
        avatar,
        balance,
        energy,
        max_energy,
        tap_power,
        is_bot,
        bot_type,
        bot_next_action_at,
        last_seen,
        last_energy_update
      )
      VALUES (
  $1::text,
  $2,
  $3,
  0,                -- ✅ баланс = 0
  $6,
$6,
  1,
  true,
  $4,
  NOW() + ($5 || ' minutes')::interval,
  NOW(),
  NOW()
)
      ON CONFLICT (telegram_id)
      DO UPDATE SET
        name = EXCLUDED.name,
        avatar = EXCLUDED.avatar,
        is_bot = true,
        bot_type = EXCLUDED.bot_type
      `,
      [
        telegramId,
        name,
        avatar || "",
        type,
        firstDelay,
        startEnergy
      ]
    );
  }

  console.log("🤖 Bot players ensured:", BOT_PLAYERS.length);
}
async function botTapToZero(bot) {
 const maxEnergy = Number(bot.max_energy || 100);
const oldEnergy = Number(bot.energy || 0);

const lastUpdate = new Date(bot.last_energy_update || Date.now());
const nowDate = new Date();

const diffSec = Math.floor((nowDate - lastUpdate) / 1000);
const regen = Math.floor(diffSec / 3);

let currentEnergy = Math.min(maxEnergy, oldEnergy + regen);

if (regen > 0) {
  await query(
    `
    UPDATE users
    SET energy = $1,
        last_energy_update = NOW()
    WHERE telegram_id = $2::text
    `,
    [currentEnergy, bot.telegram_id]
  );
}

if (currentEnergy <= 0) return;

  let taps;

  if (bot.bot_type === "aggressive") {
    taps = randomInt(120, 420);
  } else if (bot.bot_type === "medium") {
    taps = randomInt(60, 180);
  } else {
    taps = randomInt(20, 90);
  }

  taps = Math.min(currentEnergy, taps);

  let tapPower = Number(bot.tap_power || 1);
  const now = new Date();

  if (bot.tap_boost_until && now < new Date(bot.tap_boost_until)) {
    tapPower += 3;
  }

  const earned = taps * tapPower;

  await query(
    `
    UPDATE users
    SET
      balance = balance + $1,
      energy = GREATEST(energy - $2, 0),
      last_seen = NOW()
    WHERE telegram_id = $3::text
    `,
    [earned, taps, bot.telegram_id]
  );

  console.log(`🤖 ${bot.name} tapped ${taps}, earned ${earned}`);
}

async function botStakeIfOpen(bot) {
  const cycle = await getCurrentRewardCycle();
  if (!cycle || cycle.state !== "STAKE_ACTIVE") return;

  const fresh = await query(
    `
    SELECT balance
    FROM users
    WHERE telegram_id = $1::text
    `,
    [bot.telegram_id]
  );

  if (fresh.rowCount === 0) return;

  const balance = Number(fresh.rows[0].balance || 0);
  if (balance < 10000) return;

  let maxStake = 25000;

  if (bot.bot_type === "aggressive") maxStake = 90000;
  if (bot.bot_type === "medium") maxStake = 50000;

  const stakeAmount = randomInt(10000, Math.min(balance, maxStake));

  await query("BEGIN");

  try {
    await query(
      `
      UPDATE users
      SET balance = balance - $1,
          last_stake_change = NOW()
      WHERE telegram_id = $2::text
        AND balance >= $1
      `,
      [stakeAmount, bot.telegram_id]
    );

    await query(
      `
      INSERT INTO reward_event_stakes (
        cycle_id,
        telegram_id,
        stake_amount,
        last_updated
      )
      VALUES ($1, $2::text, $3, NOW())
      ON CONFLICT (cycle_id, telegram_id)
      DO UPDATE SET
        stake_amount = reward_event_stakes.stake_amount + EXCLUDED.stake_amount,
        last_updated = NOW()
      `,
      [cycle.id, bot.telegram_id, stakeAmount]
    );

    await query("COMMIT");

    console.log(`🏆 ${bot.name} staked ${stakeAmount} NXN`);
  } catch (err) {
    await query("ROLLBACK");
    throw err;
  }
}

async function runBotTick() {
  try {
    const bots = await query(`
      SELECT *
      FROM users
      WHERE is_bot = true
        AND bot_next_action_at <= NOW()
      ORDER BY bot_next_action_at ASC
      LIMIT 400
    `);

    for (const bot of bots.rows) {
      await botTapToZero(bot);
      await botStakeIfOpen(bot);

      await query(
        `
        UPDATE users
        SET bot_next_action_at = NOW() + ($1 || ' minutes')::interval
        WHERE telegram_id = $2::text
        `,
        [nextDelayMinutes(bot.bot_type), bot.telegram_id]
      );
    }
  } catch (err) {
    console.error("Bot engine error:", err);
  }
}

export async function initBotEngine() {
  await ensureBotPlayers();

  console.log("🤖 Bot engine INIT");

  setInterval(() => {
    runBotTick();
  }, 60 * 1000);
}